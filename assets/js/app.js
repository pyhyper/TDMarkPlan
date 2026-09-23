/**
 * AI Plan Executor — E-Reader Client Logic (Kindle Paperwhite & Kobo Color)
 * Pure vanilla JavaScript with zero dependencies:
 * - Domain Selector (IELTS, Gym, Vibe Code, Custom)
 * - AI Prompt Generator Wizard
 * - Per-task Learning Journal / Notes (Nhật ký học & báo cáo)
 * - Dynamic link per plan with passcode protection
 * - Pomodoro / Focus Timer
 */

const App = {
    currentPlanId: null,
    planData: null,
    selectedDate: null,
    activeTab: 'today',
    selectedDomain: 'ielts',
    domainDetails: {},
    noteDebounceTimers: {},
    subtaskDrafts: {},
    subtaskQueues: {},
    authTokens: {},
    isLocked: false,
    timer: {
        taskId: null,
        taskTitle: '',
        remainingSecs: 0,
        totalSecs: 0,
        intervalId: null,
        isRunning: false
    },

    init() {
        Workspace.init();
        Ielts.init();
        // Credentials deliberately live only in this page instance.
        Object.keys(localStorage).filter(key => key.startsWith('ereader_auth_')).forEach(key => localStorage.removeItem(key));
        window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
        this.initTheme();
        this.initFontSize();
        const storedVis = localStorage.getItem('ereader_notes_visible');
        this.notesVisible = storedVis === null ? true : storedVis === '1';
        this.applyNotesVisibility();
        this.bindEvents();
        window.addEventListener('beforeunload', event => {
            if (Object.keys(this.subtaskDrafts).length || Object.keys(Journal.drafts).length || Workspace.noteDraft !== null) { event.preventDefault(); event.returnValue = ''; }
        });
        document.getElementById('wiz-start-date').value = this.today();
        document.getElementById('wizard-today').textContent = this.today();

        // Check if dynamic link param (?p=... or ?plan=...) exists
        const urlParams = new URLSearchParams(window.location.search);
        const dynamicId = window.PLAN_ROUTE || urlParams.get('p') || urlParams.get('plan');

        if (dynamicId) {
            history.replaceState({p:dynamicId}, "", this.planUrl(dynamicId));
            this.loadPlan(dynamicId);
        } else {
            // First time visitor without a link:
            // Generate a fresh unique random dynamic ID for this session
            const randomSlug = this.generateRandomSlug();
            const newUrl = this.planUrl(randomSlug);
            window.history.replaceState({ p: randomSlug }, '', newUrl);
            this.currentPlanId = randomSlug;
            document.getElementById('dynamic-link-slug').textContent = `/${randomSlug}`;

            // Show AI Wizard by default so user can choose domain
            this.switchTab('wizard');
            this.selectDomain('ielts');
            this.showToast('Chào mừng! Chọn lĩnh vực để tạo kế hoạch học tập của bạn ');
        }
    },

    planUrl(id) { const url = new URL(encodeURIComponent(id), document.baseURI); if (Workspace.slot === 2) url.searchParams.set('slot','2'); return url.href; },

    apiFetch(url, options = {}) {
        const target = new URL(url, document.baseURI);
        let body = {}; try { body = JSON.parse(options.body || '{}'); } catch(e) {}
        const root = target.searchParams.get('p') || body.p || body.custom_id || this.currentPlanId;
        target.searchParams.set('slot', String(Workspace.slot));
        if (root) target.searchParams.set('workspace',root);
        return fetch(target.href, options);
    },

    openLinkEditor() {
        if (this.isLocked) return this.showToast('Nhập PIN để mở khóa trước khi sửa link.');
        document.getElementById('link-edit-value').value = this.currentPlanId || '';
        document.getElementById('link-edit-feedback').textContent = '';
        document.getElementById('link-edit-modal').showModal();
    },

    async applyCustomLink(button, inputId = 'custom-plan-link', feedbackId = 'custom-link-feedback') {
        const id = document.getElementById(inputId).value.trim().toLowerCase();
        const feedback = document.getElementById(feedbackId);
        if (this.isLocked) { feedback.textContent = 'Nhập PIN để mở khóa trước.'; return; }
        if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)) { feedback.textContent = 'Dùng 1–64 ký tự: chữ không dấu, số, - hoặc _; bắt đầu bằng chữ/số.'; return; }
        button.disabled = true;
        try {
            await Workspace.flush();
            const res = await App.apiFetch('api.php?action=custom_link', {method:'POST',headers:{'Content-Type':'application/json','X-Plan-Token':this.getAuthToken(this.currentPlanId)},body:JSON.stringify({p:this.currentPlanId,new_id:id,rename:!!this.planData || Workspace.summaries.some(p=>p.exists)})});
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Không đổi được link');
            if (data.token) this.setAuthToken(id,data.token);
            this.currentPlanId=id;
            if (this.planData) this.planData.plan_id=id;
            history.replaceState({p:id},'',this.planUrl(id));
            document.getElementById('dynamic-link-slug').textContent='/' + id;
            document.getElementById('custom-plan-link').value=id;
            document.getElementById('wiz-prompt-result-card').style.display='none';
            feedback.textContent='Link: ' + this.planUrl(id) + (this.planData ? ' — Link cũ đã đổi sang tên mới.' : ' — Tên được giữ khi bạn lưu kế hoạch.');
            if (inputId === 'link-edit-value') { document.getElementById('link-edit-modal').close(); this.showToast('Đã đổi link: /' + id); }
        } catch(e) { feedback.textContent=e.message; }
        finally { button.disabled=false; }
    },

    generateRandomSlug(prefix = 'plan') {
        const rand = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
        return `${prefix}-${rand}`;
    },

    today() {
        return new Intl.DateTimeFormat('en-CA', { timeZone: this.planData?.timezone || 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    },

    async exportMarkdown() {
        if (!this.planData) return this.showToast('Hãy nhập kế hoạch trước khi xuất.');
        if (this.planData.domain === 'notebook') { try { await Workspace.exportNotes(); } catch(e) { this.showToast(e.message); } return; }
        if (this.planData.domain === 'finance') return Finance.exportData();
        try {
            await Journal.flush();
            await Promise.all(Object.keys(this.subtaskDrafts).map(id => this.saveSubtasks(id)));
            await Promise.all(Object.values(this.subtaskQueues));
            await Promise.all(Object.keys(this.noteDebounceTimers).map(id => this.saveTaskNoteNow(id)));
            const res = await App.apiFetch(`api.php?action=export_markdown&p=${encodeURIComponent(this.currentPlanId)}`, {
                headers: { 'X-Plan-Token': this.getAuthToken(this.currentPlanId) }
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            const url = URL.createObjectURL(new Blob([data.markdown], { type: 'text/markdown;charset=utf-8' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentPlanId}_updated.md`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) { this.showToast('Chưa xuất được file: ' + e.message); }
    },

    // --- Authentication & Token Helpers ---
    getAuthToken(planId) {
        if (!planId) return '';
        return this.authTokens[planId] || '';
    },

    setAuthToken(planId, token) {
        if (!planId || !token) return;
        this.authTokens[planId] = token;
    },

    clearAuthToken(planId) {
        if (!planId) return;
        delete this.authTokens[planId];
        localStorage.removeItem('ereader_auth_' + planId);
    },

    // --- Theme & Appearance ---
    initTheme() {
        const saved = localStorage.getItem('ereader_theme') || 'kobo';
        this.setTheme(saved);
    },

    setTheme(themeName) {
        const legacy = {
            kindle: 'paper',
            dark: 'black',
            'candy-pink': 'kobo',
            'misty-green': 'kobo',
            'cayenne-red': 'kobo',
            'butter-yellow': 'kobo',
            'dusk-blue': 'kobo'
        };
        themeName = legacy[themeName] || themeName;
        const validThemes = ['kobo', 'paper', 'black'];
        if (!validThemes.includes(themeName)) themeName = 'kobo';

        const oldThemes = ['paper', 'black', 'kobo', 'candy-pink', 'misty-green', 'cayenne-red', 'butter-yellow', 'dusk-blue', 'dark'];
        document.body.classList.remove(...oldThemes.map(name => 'theme-' + name));
        document.body.classList.add('theme-' + themeName);
        localStorage.setItem('ereader_theme', themeName);
        const select = document.getElementById('theme-select');
        if (select) select.value = themeName;
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: themeName } }));
    },

    initFontSize() {
        const savedSize = parseInt(localStorage.getItem('ereader_font_size') || '16', 10);
        document.documentElement.style.setProperty('--base-font-size', savedSize + 'px');
    },

    adjustFontSize(delta) {
        const current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--base-font-size') || '16', 10);
        const newSize = Math.max(13, Math.min(22, current + delta));
        document.documentElement.style.setProperty('--base-font-size', newSize + 'px');
        localStorage.setItem('ereader_font_size', newSize);
    },

    // --- Routing & Plan Loading ---
    async loadPlan(planId) {
        try {
            this.showToast('Đang tải kế hoạch...');
            const token = this.getAuthToken(planId);

            const res = await App.apiFetch(`api.php?action=get_plan&p=${encodeURIComponent(planId)}`, {
                headers: { 'X-Plan-Token': token }
            });
            const data = await res.json();

            if (data.redirect_to) {
                history.replaceState({}, '', this.planUrl(data.redirect_to));
                return this.loadPlan(data.redirect_to);
            }
            if (data.root_missing) { Workspace.slot = 1; return this.loadPlan(planId); }

            // Handle Password Protected Plan
            if (data.is_protected) {
                this.currentPlanId = data.plan_id;
                this.showLockScreen(data.title || 'Kế Hoạch Được Khóa');
                return;
            }

            if (!data.success || !data.plan) {
                if (data.token) this.setAuthToken(planId, data.token);
                this.isLocked = false;
                document.body.classList.remove('is-locked');
                const emptyPlan = {
                    plan_id: planId,
                    title: planId,
                    domain: 'notebook',
                    start_date: this.today(),
                    duration_weeks: 1,
                    weeks: [],
                    task_count: 0,
                    is_empty: true,
                    has_password: false,
                    notebook: { notes: [] }
                };
                this.planData = emptyPlan;
                document.body.classList.add('has-plan');
                document.getElementById('wizard-config').hidden = true;
                document.getElementById('existing-plan-message').hidden = false;
                Workspace.render(data.workspace);
                this.currentPlanId = planId;
                const newUrl = this.planUrl(planId);
                window.history.replaceState({ p: planId }, '', newUrl);
                this.switchTab('today');
                this.renderAll();
                this.showToast(`Không gian kế hoạch: ${planId}`);
                return;
            }

            this.planData = data.plan;
            document.body.classList.add('has-plan');
            document.getElementById('wizard-config').hidden = true;
            document.getElementById('existing-plan-message').hidden = false;
            this.isLocked = false;
            document.body.classList.remove('is-locked');
            Workspace.render(data.workspace);
            this.currentPlanId = this.planData.plan_id;

            if (data.token) {
                this.setAuthToken(this.currentPlanId, data.token);
            }

            const newUrl = this.planUrl(this.currentPlanId);
            window.history.replaceState({ p: this.currentPlanId }, '', newUrl);

            this.updatePasswordBadge();

            // Set initial selected date
            const todayStr = this.today();
            const planDates = this.getAllPlanDates();
            if (planDates.includes(todayStr)) {
                this.selectedDate = todayStr;
            } else {
                this.selectedDate = planDates[0] || this.planData.start_date || todayStr;
            }

            document.getElementById('view-locked').classList.remove('active');
            this.switchTab('today');
            this.renderAll();
            this.showToast(`Đã mở: ${this.planData.title}`);
        } catch (err) {
            console.error(err);
            this.showToast('Lỗi kết nối khi tải kế hoạch');
        }
    },

    showLockScreen(title) {
        this.isLocked = true;
        this.planData = null;
        this.authTokens = {};
        this.resetTimer();
        document.body.classList.add('is-locked');
        Workspace.render();
        document.getElementById('notebook-notes').replaceChildren();
        document.getElementById('daily-tasks-list').replaceChildren();
        document.getElementById('finance-content').hidden = true;
        const titleEl = document.getElementById('locked-plan-title');
        const planTitleDisplay = document.getElementById('plan-title-display');
        const dynamicSlug = document.getElementById('dynamic-link-slug');
        const errEl = document.getElementById('unlock-error');
        const passInput = document.getElementById('unlock-password');

        if (titleEl) titleEl.textContent = title;
        if (planTitleDisplay) planTitleDisplay.textContent = title;
        if (dynamicSlug) dynamicSlug.textContent = `/${this.currentPlanId}`;
        if (errEl) errEl.style.display = 'none';
        if (passInput) {
            passInput.value = '';
            setTimeout(() => passInput.focus(), 100);
        }

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('view-locked').classList.add('active');
        this.activeTab = 'locked';

        this.updatePasswordBadge(true);
    },

    async submitUnlock(e) {
        if (e) e.preventDefault();
        const passInput = document.getElementById('unlock-password');
        const errEl = document.getElementById('unlock-error');
        const password = passInput ? passInput.value : '';

        if (!password) return;

        try {
            this.showToast('Đang kiểm tra mật khẩu...');
            const res = await App.apiFetch('api.php?action=verify_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ p: this.currentPlanId, password })
            });
            const data = await res.json();

            if (!data.success) {
                if (errEl) {
                    errEl.textContent = data.error || 'Sai mật khẩu. Vui lòng thử lại.';
                    errEl.style.display = 'block';
                }
                this.showToast('Sai mật khẩu');
                return;
            }

            this.setAuthToken(this.currentPlanId, data.token);
            passInput.value = '';
            await this.loadPlan(this.currentPlanId);
        } catch (err) {
            console.error(err);
            if (errEl) {
                errEl.textContent = 'Lỗi máy chủ trong quá trình xác thực.';
                errEl.style.display = 'block';
            }
        }
    },

    updatePasswordBadge(isLocked = false) {
        const iconEl = document.getElementById('lock-icon-indicator');
        const labelEl = document.getElementById('lock-label-indicator');
        if (!iconEl || !labelEl) return;

        if (isLocked) {
            iconEl.innerHTML = Icons.svg('lock');
            labelEl.textContent = 'Đã Khóa';
        } else if (this.planData && this.planData.has_password) {
            iconEl.innerHTML = Icons.svg('lock');
            labelEl.textContent = 'Đã Khóa PIN';
        } else {
            iconEl.innerHTML = Icons.svg('unlock');
            labelEl.textContent = 'Đặt PIN';
        }
    },

    // --- Password Settings Modal ---
    openPasswordModal() {
        if (this.isLocked || !this.planData) return this.showToast('Mở hoặc tạo dữ liệu trước khi đặt PIN.');
        const modal = document.getElementById('password-modal');
        const currentField = document.getElementById('field-current-password');
        const msgEl = document.getElementById('modal-password-msg');

        if (!modal) return;
        if (msgEl) msgEl.style.display = 'none';

        const hasPass = this.planData && this.planData.has_password;
        if (currentField) {
            currentField.style.display = hasPass ? 'block' : 'none';
        }

        const currentPassInput = document.getElementById('modal-current-password');
        const newPassInput = document.getElementById('modal-new-password');
        if (currentPassInput) currentPassInput.value = '';
        if (newPassInput) newPassInput.value = '';

        const autoDelSelect = document.getElementById('modal-auto-delete');
        if (autoDelSelect) {
            autoDelSelect.value = String(this.planData?.auto_delete_days || 0);
        }

        modal.style.display = 'flex';
    },

    closePasswordModal() {
        const modal = document.getElementById('password-modal');
        if (modal) modal.style.display = 'none';
    },

    async submitPasswordSettings(e) {
        if (e) e.preventDefault();
        if (!this.currentPlanId) return;

        const currentPassInput = document.getElementById('modal-current-password');
        const newPassInput = document.getElementById('modal-new-password');
        const msgEl = document.getElementById('modal-password-msg');

        const currentPassword = currentPassInput ? currentPassInput.value : '';
        const newPassword = newPassInput ? newPassInput.value : '';

        try {
            const res = await App.apiFetch('api.php?action=set_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    p: this.currentPlanId,
                    new_password: newPassword,
                    current_password: currentPassword
                })
            });
            const data = await res.json();

            if (!data.success) {
                if (msgEl) {
                    msgEl.textContent = data.error || 'Không thể đổi mật khẩu';
                    msgEl.style.display = 'block';
                }
                return;
            }

            if (data.token) {
                this.setAuthToken(this.currentPlanId, data.token);
            } else if (!data.has_password) {
                this.clearAuthToken(this.currentPlanId);
            }

            if (this.planData) {
                this.planData.has_password = data.has_password;
            }

            const autoDelSelect = document.getElementById('modal-auto-delete');
            const autoDelDays = autoDelSelect ? parseInt(autoDelSelect.value, 10) : 0;
            if (autoDelDays !== (this.planData?.auto_delete_days || 0)) {
                await App.apiFetch('api.php?action=set_auto_delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Plan-Token': this.getAuthToken(this.currentPlanId)
                    },
                    body: JSON.stringify({ p: this.currentPlanId, days: autoDelDays })
                });
                if (this.planData) this.planData.auto_delete_days = autoDelDays;
            }

            this.updatePasswordBadge();
            this.closePasswordModal();
            this.showToast(data.message || 'Đã lưu cài đặt kế hoạch!');
        } catch (err) {
            console.error(err);
            if (msgEl) {
                msgEl.textContent = 'Lỗi máy chủ.';
                msgEl.style.display = 'block';
            }
        }
    },

    // --- Note Visibility & Modal Controls ---
    applyNotesVisibility() {
        document.body.classList.toggle('hide-task-notes', !this.notesVisible);
        const toggleInput = document.getElementById('toggle-notes-visibility');
        if (toggleInput) toggleInput.checked = this.notesVisible;
        const iconSpan = document.getElementById('header-notes-icon');
        if (iconSpan && typeof Icons !== 'undefined' && Icons.svg) {
            iconSpan.innerHTML = Icons.svg(this.notesVisible ? 'eye' : 'eye-off');
        }
    },

    toggleNotesVisibility(visible) {
        this.notesVisible = !!visible;
        localStorage.setItem('ereader_notes_visible', this.notesVisible ? '1' : '0');
        this.applyNotesVisibility();
        this.showToast(this.notesVisible ? 'Đã bật hiển thị ghi chú' : 'Đã ẩn ghi chú trong danh sách công việc');
    },

    openPlanModal() {
        const modal = document.getElementById('plan-modal') || document.getElementById('notes-modal');
        if (!modal) return;
        this.renderModalPlans();
        this.renderModalNotes();
        modal.showModal();
    },

    openNotesModal() {
        this.openPlanModal();
    },

    updateHeaderPlanLabel() {
        const label = document.getElementById('header-plan-label');
        if (!label) return;
        const currentSlot = (typeof Workspace !== 'undefined') ? Workspace.slot : 1;
        const info = (typeof Workspace !== 'undefined' && Workspace.summaries) ? Workspace.summaries.find(p => p.slot === currentSlot) : null;
        let title = this.planData?.title || info?.title || `Plan ${currentSlot}`;
        if (title.length > 20) title = title.substring(0, 18) + '…';
        label.textContent = `Plan ${currentSlot}: ${title}`;
    },

    renderModalPlans() {
        const container = document.getElementById('modal-plans-list');
        if (!container) return;
        container.replaceChildren();

        const summaries = (typeof Workspace !== 'undefined' && Workspace.summaries && Workspace.summaries.length)
            ? Workspace.summaries
            : [
                { slot: 1, exists: !!this.planData, title: this.planData?.title || 'Plan 1', domain: this.planData?.domain || '' },
                { slot: 2, exists: false, title: 'Thêm plan thứ hai', domain: '' }
            ];

        const currentSlot = (typeof Workspace !== 'undefined') ? Workspace.slot : 1;

        summaries.forEach(item => {
            const card = document.createElement('div');
            card.className = `modal-plan-card slot-${item.slot}${item.slot === currentSlot ? ' is-active' : ''}`;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${item.exists ? item.title : (item.slot === 2 ? 'Thêm plan thứ hai' : 'Tạo plan')} (Slot ${item.slot})`);

            const headerRow = document.createElement('div');
            headerRow.style.display = 'flex';
            headerRow.style.justifyContent = 'space-between';
            headerRow.style.alignItems = 'center';

            const slotBadge = document.createElement('span');
            slotBadge.style.fontSize = '0.75rem';
            slotBadge.style.fontWeight = '700';
            slotBadge.style.color = 'var(--ink-secondary)';
            slotBadge.textContent = `PLAN 0${item.slot}`;

            const statusBadge = document.createElement('span');
            if (item.slot === currentSlot) {
                statusBadge.className = 'badge-active-plan';
                statusBadge.textContent = '✓ Đang hiển thị';
            } else if (item.exists) {
                statusBadge.textContent = 'Có sẵn';
                statusBadge.style.fontSize = '0.72rem';
                statusBadge.style.color = 'var(--ink-secondary)';
            } else {
                statusBadge.textContent = 'Chưa tạo';
                statusBadge.style.fontSize = '0.72rem';
                statusBadge.style.color = 'var(--ink-muted)';
            }

            headerRow.append(slotBadge, statusBadge);

            const titleEl = document.createElement('h4');
            titleEl.style.margin = '0.2rem 0';
            titleEl.style.fontSize = '0.95rem';
            titleEl.style.fontWeight = '700';
            titleEl.textContent = item.exists ? item.title : (item.slot === 2 ? 'Thêm plan thứ hai' : 'Tạo plan đầu tiên');

            const domainEl = document.createElement('div');
            domainEl.style.fontSize = '0.78rem';
            domainEl.style.color = 'var(--ink-secondary)';
            const domainLabels = {
                ielts: 'Học tập & IELTS',
                fitness: 'Lịch tập & Thể hình',
                code: 'Vibe Code & AI',
                finance: 'Tài chính & FIRE',
                notebook: 'Sổ ghi chú tự do'
            };
            domainEl.textContent = item.domain ? (domainLabels[item.domain] || item.domain) : (item.exists ? 'Kế hoạch học tập' : 'Ô plan còn trống');

            const actionsRow = document.createElement('div');
            actionsRow.style.display = 'flex';
            actionsRow.style.alignItems = 'center';
            actionsRow.style.gap = '0.5rem';
            actionsRow.style.marginTop = 'auto';

            const actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.flex = '1';
            if (item.slot === currentSlot) {
                actionBtn.className = 'btn-sample is-active-plan-btn';
                actionBtn.textContent = '✓ Đang hiển thị';
            } else if (item.exists) {
                actionBtn.className = 'btn-sample';
                actionBtn.textContent = 'Xem kế hoạch này →';
            } else {
                actionBtn.className = 'btn-sample';
                actionBtn.textContent = '+ Thiết lập plan này';
            }
            actionsRow.appendChild(actionBtn);

            if (item.exists) {
                const btnDelPlan = document.createElement('button');
                btnDelPlan.type = 'button';
                btnDelPlan.className = 'btn-plan-delete';
                btnDelPlan.title = `Xóa kế hoạch (Slot ${item.slot})`;
                btnDelPlan.setAttribute('aria-label', `Xóa kế hoạch: ${item.title}`);
                btnDelPlan.innerHTML = (typeof Icons !== 'undefined' && Icons.svg) ? `${Icons.svg('trash')}` : '🗑';
                btnDelPlan.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const ok = await App.confirm({
                        title: `Xóa kế hoạch: ${item.title}`,
                        message: `Hành động này sẽ xóa vĩnh viễn kế hoạch (Slot ${item.slot}), toàn bộ nhiệm vụ và ghi chú. Bạn có chắc chắn muốn xóa không?`,
                        okText: 'Xóa vĩnh viễn',
                        danger: true
                    });
                    if (!ok) return;
                    await App.deletePlan(item.slot);
                });
                actionsRow.appendChild(btnDelPlan);
            }

            const selectCard = async (e) => {
                if (e && e.target && e.target.closest && e.target.closest('.btn-plan-delete')) {
                    return;
                }
                const modal = document.getElementById('plan-modal') || document.getElementById('notes-modal');
                if (modal) modal.close();

                if (item.slot === currentSlot) {
                    if (item.exists) {
                        App.switchTab('today');
                    } else {
                        App.switchTab('wizard');
                    }
                    return;
                }

                await Workspace.select(item.slot);

                if (item.exists) {
                    App.switchTab('today');
                    App.showToast(`Đang hiển thị Plan ${item.slot}: ${item.title}`);
                } else {
                    App.switchTab('wizard');
                    App.showToast(`Đang thiết lập plan ${item.slot}. Hãy chọn lĩnh vực hoặc nhập PLAN.md.`);
                }
            };

            card.addEventListener('click', selectCard);
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectCard(e);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectCard(e);
                }
            });

            card.append(headerRow, titleEl, domainEl, actionsRow);
            container.appendChild(card);
        });
    },

    async createPlanFromModal() {
        const summaries = (typeof Workspace !== 'undefined') ? Workspace.summaries : [];
        const emptySlot = summaries.find(p => !p.exists);
        const modal = document.getElementById('plan-modal') || document.getElementById('notes-modal');
        if (emptySlot) {
            if (modal) modal.close();
            await Workspace.select(emptySlot.slot);
            this.switchTab('wizard');
            this.showToast(`Đang thiết lập plan ${emptySlot.slot}. Hãy chọn lĩnh vực hoặc nhập PLAN.md.`);
        } else {
            if (confirm('Link này đã dùng đủ 2 plan. Bạn có muốn mở trang để tạo một link kế hoạch mới không?')) {
                window.location.href = 'index.php';
            }
        }
    },

    confirm({ title = 'Xác nhận', message = 'Bạn có chắc chắn muốn thực hiện hành động này?', okText = 'Xóa', cancelText = 'Hủy', danger = true } = {}) {
        const dialog = document.getElementById('app-confirm-dialog');
        if (!dialog || typeof dialog.showModal !== 'function') {
            return Promise.resolve(window.confirm(message));
        }

        const titleEl = document.getElementById('confirm-modal-title');
        const descEl = document.getElementById('confirm-modal-desc');
        const okBtn = document.getElementById('btn-confirm-ok');
        const cancelBtn = document.getElementById('btn-confirm-cancel');
        const iconBadge = document.getElementById('confirm-modal-icon-badge');

        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = message;
        if (okBtn) {
            okBtn.textContent = okText;
            okBtn.className = danger ? 'btn-danger-confirm' : 'btn-primary';
        }
        if (cancelBtn) cancelBtn.textContent = cancelText;
        if (iconBadge && typeof Icons !== 'undefined' && Icons.svg) {
            iconBadge.innerHTML = danger ? Icons.svg('trash') : Icons.svg('alert');
        }

        return new Promise((resolve) => {
            let resolved = false;

            const handleOk = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    dialog.close();
                    resolve(true);
                }
            };

            const handleCancel = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    dialog.close();
                    resolve(false);
                }
            };

            const handleClose = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve(false);
                }
            };

            const cleanup = () => {
                okBtn?.removeEventListener('click', handleOk);
                cancelBtn?.removeEventListener('click', handleCancel);
                dialog.removeEventListener('close', handleClose);
            };

            okBtn?.addEventListener('click', handleOk);
            cancelBtn?.addEventListener('click', handleCancel);
            dialog.addEventListener('close', handleClose);

            dialog.showModal();
        });
    },

    async deletePlan(slot) {
        try {
            const token = this.getAuthToken(this.currentPlanId);
            const res = await App.apiFetch('api.php?action=delete_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Plan-Token': token
                },
                body: JSON.stringify({
                    p: this.currentPlanId,
                    slot: slot
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Không xóa được kế hoạch');
            this.showToast('Đã xóa kế hoạch thành công');
            const modal = document.getElementById('plan-modal') || document.getElementById('notes-modal');
            if (modal && modal.open) modal.close();

            const summaries = await this.fetchSummaries();
            const remaining = summaries.find(p => p.exists);
            if (remaining) {
                await Workspace.select(remaining.slot);
            } else {
                window.location.reload();
            }
        } catch (e) {
            this.showToast(e.message || 'Lỗi khi xóa kế hoạch');
        }
    },

    async fetchSummaries() {
        try {
            const res = await App.apiFetch(`api.php?action=list_plans&p=${encodeURIComponent(this.currentPlanId)}`, {
                headers: { 'X-Plan-Token': this.getAuthToken(this.currentPlanId) }
            });
            const data = await res.json();
            if (data.success && data.plans && typeof Workspace !== 'undefined') {
                Workspace.render(data.plans);
                return data.plans;
            }
        } catch (e) {
            console.error(e);
        }
        return (typeof Workspace !== 'undefined' ? Workspace.summaries : []);
    },

    startRenameTask(taskId) {
        const wrap = document.getElementById(`task-title-wrap-${taskId}`);
        const task = this.findTask(taskId);
        if (!wrap || !task) return;

        const currentTitle = task.title;
        wrap.innerHTML = `
            <form class="task-rename-form" onsubmit="event.preventDefault(); App.submitRenameTask('${taskId}', this.querySelector('.task-rename-input').value);">
                <input type="text" class="task-rename-input" value="${this.escapeHtml(currentTitle)}" maxlength="300" required>
                <button type="submit" class="btn-rename-save" title="Lưu tên">${(typeof Icons !== 'undefined' && Icons.svg) ? Icons.svg('check') : '✓'}</button>
                <button type="button" class="btn-rename-cancel" title="Hủy" onclick="App.cancelRenameTask('${taskId}', '${this.escapeHtml(currentTitle)}')">${(typeof Icons !== 'undefined' && Icons.svg) ? Icons.svg('x') : '✕'}</button>
            </form>
        `;
        const input = wrap.querySelector('.task-rename-input');
        if (input) {
            input.focus();
            input.select();
        }
    },

    cancelRenameTask(taskId, originalTitle) {
        const wrap = document.getElementById(`task-title-wrap-${taskId}`);
        if (!wrap) return;
        wrap.innerHTML = `
            <span class="task-title" id="task-title-${taskId}">${this.escapeHtml(originalTitle)}</span>
            <button type="button" class="btn-task-rename" title="Đổi tên nhiệm vụ" aria-label="Đổi tên nhiệm vụ" onclick="App.startRenameTask('${taskId}')">
                ${(typeof Icons !== 'undefined' && Icons.svg) ? Icons.svg('edit') : '✎'}
            </button>
        `;
    },

    async submitRenameTask(taskId, newTitle) {
        const clean = (newTitle || '').trim();
        if (!clean) return this.showToast('Tên nhiệm vụ không được để trống');
        const task = this.findTask(taskId);
        if (!task) return;

        try {
            const token = this.getAuthToken(this.currentPlanId);
            const res = await App.apiFetch('api.php?action=update_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Plan-Token': token
                },
                body: JSON.stringify({
                    p: this.currentPlanId,
                    task_id: taskId,
                    title: clean
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Không đổi được tên nhiệm vụ');
            task.title = clean;
            this.cancelRenameTask(taskId, clean);
            this.showToast('Đã đổi tên nhiệm vụ');
            if (this.currentView === 'toc') this.renderTocView();
        } catch (e) {
            this.showToast(e.message || 'Lỗi đổi tên nhiệm vụ');
        }
    },

    renderModalNotes() {
        const host = document.getElementById('modal-notes-container');
        if (!host) return;
        host.replaceChildren();

        if (!this.planData) {
            host.innerHTML = '<p style="color:var(--ink-secondary); font-size:0.85rem;">Chưa có dữ liệu kế hoạch được tải.</p>';
            return;
        }

        if (!this.planData.notebook) {
            this.planData.notebook = { notes: [] };
        }
        if (!Array.isArray(this.planData.notebook.notes)) {
            this.planData.notebook.notes = [];
        }

        const countEl = document.getElementById('modal-notes-count');
        if (countEl) countEl.textContent = `${this.planData.notebook.notes.length}/2 ghi chú`;

        const btnAdd = document.getElementById('btn-modal-add-note');
        if (btnAdd) btnAdd.disabled = this.planData.notebook.notes.length >= 2;

        Journal.renderCards(
            host,
            this.planData.notebook.notes,
            (cards) => {
                if (!this.planData) return;
                this.planData.notebook.notes = cards;
                if (countEl) countEl.textContent = `${cards.length}/2 ghi chú`;
                if (btnAdd) btnAdd.disabled = cards.length >= 2;
            },
            async () => {
                if (!this.currentPlanId) return;
                const snapshot = (this.planData?.notebook?.notes || []).slice();
                const res = await this.apiFetch('api.php?action=save_notebook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Plan-Token': this.getAuthToken(this.currentPlanId)
                    },
                    body: JSON.stringify({ p: this.currentPlanId, notes: snapshot })
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || 'Không lưu được ghi chú');
                if (typeof Workspace !== 'undefined' && Workspace.renderNotebook && this.planData.domain === 'notebook') {
                    Workspace.renderNotebook();
                }
            },
            this.planData.title || 'Ghi chú'
        );
    },

    addQuickNote() {
        if (!this.planData) {
            this.showToast('Vui lòng mở một plan để tạo ghi chú');
            return;
        }
        if (!this.planData.notebook) this.planData.notebook = { notes: [] };
        if (this.planData.notebook.notes.length >= 2) {
            this.showToast('Đã đủ tối đa 2 ghi chú');
            return;
        }
        this.planData.notebook.notes.push('');
        this.renderModalNotes();
    },

    // --- Domain Selection & Wizard Presets ---
    selectDomain(domainKey) {
        this.selectedDomain = domainKey;
        document.body.classList.toggle('finance-setup', domainKey === 'finance');
        document.getElementById('finance-onboarding').hidden = domainKey !== 'finance';
        document.getElementById('btn-ielts-level').hidden = domainKey !== 'ielts';
        document.getElementById('btn-fitness-setup').hidden = domainKey !== 'fitness';
        document.getElementById('btn-code-setup').hidden = domainKey !== 'vibecode';
        document.getElementById('btn-finance-setup').hidden = domainKey !== 'finance';
        document.getElementById('btn-start-finance').hidden = domainKey !== 'finance' || !Finance.draft;
        document.querySelectorAll('.domain-card').forEach(card => {
            card.classList.toggle('active', card.getAttribute('data-domain') === domainKey);
        });

        const titleInput = document.getElementById('wiz-title');
        const durationSelect = document.getElementById('wiz-duration');
        const minutesSelect = document.getElementById('wiz-minutes');
        const daysSelect = document.getElementById('wiz-days');
        const levelInput = document.getElementById('wiz-current-level');
        const targetInput = document.getElementById('wiz-target-goal');
        const instantBtn = document.getElementById('btn-wiz-instant-sample');

        if (instantBtn) instantBtn.hidden = domainKey === 'finance';
        switch (domainKey) {
            case 'finance':
                titleInput.value = 'Tài chính cá nhân & FIRE';
                levelInput.value = 'Bắt đầu quản lý thu chi';
                targetInput.value = 'An toàn, độc lập và tự do tài chính';
                minutesSelect.value = '30';
                break;
            case 'ielts':
                if (titleInput) titleInput.value = 'Luyện thi IELTS 6.5 Cấp Tốc';
                if (durationSelect) durationSelect.value = '12';
                if (minutesSelect) minutesSelect.value = '90';
                if (daysSelect) daysSelect.value = 'mon,tue,wed,thu,fri';
                if (levelInput) levelInput.value = 'Chưa biết trình độ IELTS — cần bài đánh giá đầu vào';
                if (targetInput) targetInput.value = 'IELTS 6.5 Overall (Listening 6.5, Speaking 6.5)';
                if (instantBtn) instantBtn.textContent = ' Dùng Luôn Kế Hoạch Mẫu: IELTS 6.5 (12 Tuần)';
                break;

            case 'fitness':
                if (titleInput) titleInput.value = 'Kế hoạch Gym & Ăn Uống';
                if (durationSelect) durationSelect.value = '6';
                if (minutesSelect) minutesSelect.value = '45';
                if (daysSelect) daysSelect.value = 'mon,wed,fri,sun';
                if (levelInput) levelInput.value = 'Mới bắt đầu tập, chưa theo dõi calories';
                if (targetInput) targetInput.value = 'Tăng cơ, cải thiện thể lực và xây dựng thói quen ăn uống';
                if (instantBtn) instantBtn.textContent = ' Dùng Luôn Kế Hoạch Mẫu: Couch to 5K (6 Tuần)';
                break;

            case 'vibecode':
                if (titleInput) titleInput.value = 'Vibe Coding — Từ ý tưởng đến ứng dụng';
                if (durationSelect) durationSelect.value = '1';
                if (minutesSelect) minutesSelect.value = '30';
                if (daysSelect) daysSelect.value = 'mon,tue,wed,thu,fri,sat';
                if (levelInput) levelInput.value = 'Chưa biết lập trình, muốn xây dự án với AI';
                if (targetInput) targetInput.value = 'Chọn nền tảng phù hợp, xây và triển khai ứng dụng thực tế';
                if (instantBtn) instantBtn.textContent = ' Dùng Kế Hoạch Mẫu: Vibe Code (1 Tuần)';
                break;

            case 'custom':
                if (titleInput) titleInput.value = 'Kế Hoạch Cá Nhân';
                if (levelInput) levelInput.value = 'Người mới bắt đầu';
                if (targetInput) targetInput.value = 'Hoàn thành mục tiêu đã đề ra';
                if (instantBtn) instantBtn.textContent = ' Dùng Kế Hoạch Mẫu Tương Tự';
                break;
        }

        const saved = this.domainDetails[domainKey];
        if (saved) {
            levelInput.value = saved.level;
            targetInput.value = saved.target;
            minutesSelect.value = saved.minutes;
            if (saved.days) daysSelect.value = saved.days;
        }
        if (instantBtn) instantBtn.hidden = domainKey === 'ielts' && document.getElementById('ielts-test-type').value !== 'academic';
        // Hide old generated prompts if changing domain
        const promptCard = document.getElementById('wiz-prompt-result-card');
        const pasteCard = document.getElementById('wiz-paste-result-card');
        if (promptCard) promptCard.style.display = 'none';
        if (pasteCard) pasteCard.style.display = 'none';
    },

    generateAiPromptFromWizard() {
        if (this.selectedDomain === 'finance') return Finance.generatePrompt();
        const title = document.getElementById('wiz-title').value.trim() || 'Kế Hoạch Học Tập';
        const startDate = document.getElementById('wiz-start-date').value || this.today();
        const duration = document.getElementById('wiz-duration').value || '12';
        const minutes = document.getElementById('wiz-minutes').value || '90';
        const days = document.getElementById('wiz-days').value || 'mon,tue,wed,thu,fri';
        const level = document.getElementById('wiz-current-level').value.trim() || 'Người mới bắt đầu';
        const target = document.getElementById('wiz-target-goal').value.trim() || 'Đạt mục tiêu đề ra';

        // Suggest plan_id slug
        const slug = this.currentPlanId || this.generateRandomSlug(this.selectedDomain);

        const promptText = `Bạn là chuyên gia lập kế hoạch cá nhân chuyên nghiệp. Hãy thiết lập một lịch trình chi tiết theo định dạng chuẩn PLAN.md để ứng dụng AI Plan Executor có thể phân tích và thực thi.

THÔNG TIN MỤC TIÊU CỦA TÔI:
- Ngày hiện tại: ${this.today()} (Asia/Ho_Chi_Minh)
- Lĩnh vực: ${this.selectedDomain}
- Kế hoạch: ${title}
- Trình độ hiện tại: ${level}
- Mục tiêu cần đạt: ${target}
- Thời gian khả dụng mỗi ngày: ${minutes} phút/ngày
- Các ngày thực hiện trong tuần: [${days}]
- Ngày bắt đầu chính xác: ${startDate}
- Tổng thời lượng: ${duration} tuần

THÔNG TIN CHUYÊN BIỆT:
${this.selectedDomain === 'ielts' ? Ielts.prompt() : this.domainDetails[this.selectedDomain]?.details || "Chưa cung cấp thêm; không tự suy đoán thông tin cá nhân."}
${this.selectedDomain === 'vibecode' ? `
KHỞI ĐỘNG DỰ ÁN BẮT BUỘC:
- Với dự án mới: chỉ MỘT task setup đầu tiên, 15–20 phút (không vượt thời gian khả dụng), tạo cùng lúc bản khung ngắn gọn của ARCHITECTURE.md, PLAN.md, SPEC.md và DESIGN.md trong repository. Không tách thành bốn task hoặc kéo dài nhiều ngày. Không tạo subtask tự động, không đánh dấu hoàn thành sẵn.
- Với dự án đang làm tiếp: dùng MỘT task rà soát ngắn các tài liệu hiện có và bổ sung phần còn thiếu; không yêu cầu tạo lại từ đầu hay lặp lại việc đã hoàn thành. Tiếp tục từ tiến độ, khó khăn và mục tiêu đợt này do người dùng cung cấp.
- ARCHITECTURE.md: nền tảng, thành phần hệ thống, luồng dữ liệu, database, môi trường triển khai, giới hạn hosting và lý do lựa chọn.
- PLAN.md: phạm vi MVP, backlog, thứ tự phụ thuộc, sprint/mốc bàn giao, kiểm thử và triển khai.
- SPEC.md: đối tượng sử dụng, yêu cầu chức năng/phi chức năng, dữ liệu/API, tiêu chí nghiệm thu và phần ngoài phạm vi.
- DESIGN.md: luồng người dùng, màn hình/wireframe, trạng thái loading/empty/error, responsive và khả năng truy cập; dự án không có UI thì mô tả giao diện API/CLI.
- Description của task setup liệt kê yêu cầu tối thiểu cho cả bốn file; mỗi file chỉ cần đề mục và vài gạch đầu dòng đủ bắt đầu. Cập nhật dần khi làm, không dành cả sprint để viết tài liệu.
- Giữ task ngắn, tập trung một đầu ra. Người dùng chủ động chọn việc và chia sprint; không ép lịch nghi thức dài hoặc sprint cố định nếu chọn tự quản lý. Chỉ lên đợt ngắn theo số tuần đã chọn, để người dùng tiếp tục/replan sau đợt này.
- PLAN.md trong repository dự án là tài liệu triển khai sản phẩm, khác với file lịch PLAN.md trả về cho ứng dụng này. Chỉ trả file lịch, với một task setup chung cho bốn tài liệu.
- Nếu chưa chọn stack/hosting, làm rõ lựa chọn trong task setup chung; không mặc định Python hoặc ứng dụng AI.
` : ''}

=======================================================
YÊU CẦU ĐỊNH DẠNG TUYỆT ĐỐI (QUAN TRỌNG NHẤT):
1. Bắt đầu bằng khối YAML frontmatter:
---
plan_id: ${slug}
current_date: ${this.today()}
domain: ${this.selectedDomain}
${this.selectedDomain === "finance" && Finance.draft ? "finance_data: " + JSON.stringify(Finance.draft) + "\n" : ""}title: ${title}
version: 1.0
timezone: Asia/Ho_Chi_Minh
goal:
  type: general
  description: ${target}
schedule:
  days: [${days}]
  daily_minutes: ${minutes}
start_date: ${startDate}
duration_weeks: ${duration}
---

2. Tiếp theo là các section Markdown:
# Goal
## Objective
${target}
## Current Level
${level}
## Target
${target}

# Constraints
- Available days: [${days}]
- Daily time: ${minutes} minutes

3. Lịch chi tiết từng tuần bắt đầu bằng "# Week 1", "# Week 2", v.v.
Mỗi tuần là 7 ngày tính từ start_date, không mặc định start_date là thứ Hai. Liệt kê ngày theo thứ tự thời gian, chỉ chọn các ngày khả dụng và không đặt task trước start_date. Tạo đủ ${duration} tuần; tổng phút mỗi ngày không quá ${minutes}.
Mỗi ngày bắt đầu bằng "## Monday", "## Tuesday", ...
Mỗi nhiệm vụ có định dạng task list kèm metadata thụt lề:
- [ ] Tên nhiệm vụ cụ thể
  - id: duy-nhat-${slug}-w1-01
  - type: grammar|vocabulary|speaking|listening|reading|writing|coding|exercise|review|custom
  - duration: 25
  - priority: high|medium|low
  - target: số_lượng_nếu_có
  - unit: đơn_vị_nếu_có
  - status: pending
  - actual_minutes: 0
  - note: ""
  - description: "Mô tả công việc, cách thực hiện và tiêu chí hoàn thành"
Không tạo subtask hoặc ghi chú thay người dùng. Chỉ tạo task chính có description; người dùng tự thêm subtask và tối đa 2 ghi chú trong web. Nếu chưa biết trình độ, lên lịch đánh giá đầu vào trước; không tự gán điểm IELTS.
Chọn đúng MỘT giá trị type và priority, không chép chuỗi lựa chọn có dấu |. Bỏ target/unit nếu không cần.

=======================================================
LỆNH BẮT BUỘC ĐỐI VỚI AI (ChatGPT / Gemini):
- CHỈ xuất ra DUY NHẤT 1 code block Markdown (\`\`\`markdown ... \`\`\`) chứa toàn bộ file PLAN.md chuẩn YAML frontmatter.
- TUYỆT ĐỐI KHÔNG viết thêm bất kỳ lời chào, lời mở đầu hay kết luận nào ngoài code block đó, để tôi có thể bấm nút Copy dán thẳng vào ứng dụng web.`;

        const box = document.getElementById('wiz-generated-prompt-box');
        if (box) box.value = promptText;

        const promptCard = document.getElementById('wiz-prompt-result-card');
        const pasteCard = document.getElementById('wiz-paste-result-card');
        if (promptCard) promptCard.style.display = 'block';
        if (pasteCard) pasteCard.style.display = 'block';

        promptCard.scrollIntoView({ behavior: 'smooth' });
        this.showToast('Đã tạo Prompt thành công! Copy và gửi cho ChatGPT / Gemini.');
    },

    copyWizardPrompt() {
        const box = document.getElementById('wiz-generated-prompt-box');
        if (!box || !box.value) return;

        navigator.clipboard.writeText(box.value).then(() => {
            this.showToast('Đã copy Prompt! Dán vào ChatGPT hoặc Gemini nhé.');
        }).catch(() => {
            prompt('Copy prompt này:', box.value);
        });
    },

    async useInstantSampleForDomain() {
        if (this.selectedDomain === 'ielts' && document.getElementById('ielts-test-type').value !== 'academic') {
            this.generateAiPromptFromWizard();
            return this.showToast('Tạo prompt theo loại thi đã chọn; mẫu có sẵn chỉ dành cho Academic.');
        }
        let sampleName = 'ielts-6.5';
        if (this.selectedDomain === 'fitness') sampleName = 'fitness-5k';
        if (this.selectedDomain === 'vibecode') sampleName = 'coding-roadmap';

        try {
            this.showToast('Đang nạp kế hoạch mẫu...');
            const res = await App.apiFetch(`api.php?action=load_example&name=${encodeURIComponent(sampleName)}`);
            const data = await res.json();
            if (!data.success || !data.markdown) {
                this.showToast('Không tải được mẫu');
                return;
            }

            let md = data.markdown.replace(/^---/, `---\ncurrent_date: ${this.today()}\ndomain: ${this.selectedDomain}`);
            const chosenStartDate = document.getElementById('wiz-start-date').value || this.today();
            const password = document.getElementById('wiz-password').value || null;

            // Update start_date in frontmatter to user's chosen start date
            md = md.replace(/^start_date:\s*[0-9]{4}-[0-9]{2}-[0-9]{2}/m, `start_date: ${chosenStartDate}`);
            if (this.selectedDomain === 'vibecode') {
                // Keep the setup first even when a sample starts mid-week.
                const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                const allowed = document.getElementById('wiz-days').value.split(',');
                const firstDay = new Date(chosenStartDate + 'T00:00:00').getDay();
                const dates = Array.from({length:7},(_,i)=>names[(firstDay+i)%7]).filter(name=>allowed.includes(name.slice(0,3).toLowerCase()));
                const parts = md.split(/(?=^## (?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*$)/m);
                md = parts[0] + parts.slice(1,dates.length+1).map((part,i)=>part.replace(/^## \w+/, '## ' + dates[i])).join('');
                md = md.replace(/days: \[[^\]]*\]/, `days: [${allowed.join(',')}]`);
            }

            // Update plan_id to the user's dynamic link ID
            const targetSlug = this.currentPlanId || this.generateRandomSlug(this.selectedDomain);
            md = md.replace(/^plan_id:\s*[a-zA-Z0-9_\-]+/m, `plan_id: ${targetSlug}`);

            await this.savePlanMarkdown(md, targetSlug, password);
        } catch (e) {
            console.error(e);
            this.showToast('Lỗi khi nạp mẫu');
        }
    },

    async importFromWizard() {
        const pasteEl = document.getElementById('wiz-paste-markdown');
        if (!pasteEl || !pasteEl.value.trim()) {
            alert('Vui lòng dán nội dung Markdown do AI trả về vào ô trước.');
            return;
        }
        let md = pasteEl.value.trim();

        // Strip surrounding ```markdown ... ``` if user copied the code block wrapper
        if (md.startsWith('```')) {
            md = md.replace(/^```[a-zA-Z0-9_-]*\n/, '').replace(/\n```$/, '');
        }

        const password = document.getElementById('wiz-password').value || null;
        const targetSlug = this.currentPlanId || this.generateRandomSlug(this.selectedDomain);

        await this.savePlanMarkdown(md, targetSlug, password);
    },

    findTask(id) {
        for (const week of Object.values(this.planData?.weeks || {})) {
            for (const day of Object.values(week.days)) {
                const task = day.tasks.find(t => t.id === id);
                if (task) return task;
            }
        }
        return null;
    },

    saveSubtasks(taskId) {
        const task = this.findTask(taskId);
        const subtasks = JSON.parse(JSON.stringify(this.subtaskDrafts[taskId] || task.subtasks || []));
        const planId = this.currentPlanId;
        const previous = this.subtaskQueues[taskId] || Promise.resolve();
        const request = previous.catch(() => {}).then(async () => {
            const res = await App.apiFetch('api.php?action=update_task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Plan-Token': this.getAuthToken(planId) },
                body: JSON.stringify({ p: planId, task_id: taskId, subtasks })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Không lưu được việc nhỏ');
            task.subtasks = subtasks;
            if (JSON.stringify(this.subtaskDrafts[taskId]) === JSON.stringify(subtasks)) {
                delete this.subtaskDrafts[taskId];
                document.querySelectorAll(`[data-subtask-parent="${taskId}"] .subtask-save-status`).forEach(el => { el.textContent = 'Đã lưu ✓'; });
            }
            this.showToast('Đã lưu việc nhỏ và ghi chú');
        });
        this.subtaskQueues[taskId] = request;
        return request;
    },

    renderSubtasks(task, container) {
        const section = document.createElement('section');
        section.className = 'subtask-section';
        section.dataset.subtaskParent = task.id;
        const subtasks = this.subtaskDrafts[task.id] || task.subtasks || [];
        const heading = document.createElement('h4');
        heading.textContent = `Việc nhỏ · ${subtasks.filter(s => s.completed).length}/${subtasks.length} hoàn thành`;
        section.appendChild(heading);
        const edit = (index, key, value) => {
            if (!this.subtaskDrafts[task.id]) this.subtaskDrafts[task.id] = JSON.parse(JSON.stringify(task.subtasks || []));
            this.subtaskDrafts[task.id][index][key] = value;
        };
        subtasks.forEach((sub, index) => {
            const row = document.createElement('div');
            row.className = 'subtask-row';

            const headerRow = document.createElement('div');
            headerRow.className = 'subtask-header-row';

            const label = document.createElement('label');
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.checked = sub.completed;
            check.addEventListener('change', () => {
                edit(index, 'completed', check.checked);
                heading.textContent = `Việc nhỏ · ${this.subtaskDrafts[task.id].filter(s => s.completed).length}/${subtasks.length} hoàn thành`;
                this.saveSubtasks(task.id).catch(e => this.showToast(e.message));
            });
            label.append(check, document.createTextNode(' ' + sub.title));
            headerRow.appendChild(label);

            const btnDelSub = document.createElement('button');
            btnDelSub.type = 'button';
            btnDelSub.className = 'btn-delete-subtask';
            btnDelSub.title = 'Xóa việc nhỏ này';
            btnDelSub.setAttribute('aria-label', `Xóa việc nhỏ: ${sub.title}`);
            btnDelSub.innerHTML = (typeof Icons !== 'undefined' && Icons.svg) ? Icons.svg('trash') : '🗑';
            btnDelSub.addEventListener('click', async (e) => {
                e.stopPropagation();
                const ok = await App.confirm({
                    title: 'Xóa việc nhỏ',
                    message: `Bạn có chắc chắn muốn xóa việc nhỏ "${sub.title}" không?`,
                    okText: 'Xóa việc nhỏ',
                    danger: true
                });
                if (!ok) return;
                const draft = this.subtaskDrafts[task.id] || JSON.parse(JSON.stringify(task.subtasks || []));
                draft.splice(index, 1);
                this.subtaskDrafts[task.id] = draft;
                await this.saveSubtasks(task.id);
                this.renderDailyView();
                this.showToast('Đã xóa việc nhỏ');
            });
            headerRow.appendChild(btnDelSub);

            row.appendChild(headerRow);
            Journal.renderCards(row, Journal.cards(sub), cards => {
                edit(index, 'note_cards', cards);
                edit(index, 'notes', cards[0] || '');
            }, () => this.saveSubtasks(task.id), sub.title);
            section.appendChild(row);
        });
        const form = document.createElement('form');
        form.className = 'subtask-add';
        const input = document.createElement('input');
        input.className = 'form-input';
        input.placeholder = 'Ví dụ: Luyện Speaking Part 1 trong 10 phút';
        input.setAttribute('aria-label', 'Tên việc nhỏ mới');
        input.required = true;
        input.maxLength = 300;
        const add = document.createElement('button');
        add.className = 'btn-sample';
        add.textContent = '+ Thêm việc nhỏ';
        form.append(input, add);
        form.addEventListener('submit', async e => {
            e.preventDefault();
            if (!input.value.trim()) return;
            const draft = this.subtaskDrafts[task.id] || JSON.parse(JSON.stringify(task.subtasks || []));
            if (draft.length >= 100) return this.showToast('Tối đa 100 việc nhỏ cho mỗi task.');
            draft.push({ id: this.generateRandomSlug('sub'), title: input.value.trim(), completed: false, notes: '', note_cards: [] });
            this.subtaskDrafts[task.id] = draft;
            section.remove();
            this.renderSubtasks(task, container);
            try { await this.saveSubtasks(task.id); } catch (e) { this.showToast(e.message + ' — bấm Lưu ghi chú để thử lại'); }
        });
        section.appendChild(form);
        container.appendChild(section);
    },

    applyDomainSetup(domain, modalId, setup) {
        this.domainDetails[domain] = setup;
        document.getElementById('wiz-current-level').value = setup.level;
        document.getElementById('wiz-target-goal').value = setup.target;
        document.getElementById('wiz-minutes').value = setup.minutes;
        if (setup.days) {
            const days = document.getElementById('wiz-days');
            if (!Array.from(days.options).some(o => o.value === setup.days)) days.add(new Option('Thứ 2, 4, 6', setup.days));
            days.value = setup.days;
        }
        document.getElementById(modalId).close();
        document.getElementById('wiz-prompt-result-card').style.display = 'none';
        this.showToast('Đã chọn. Bấm Tạo Prompt để áp dụng.');
    },

    applyFitnessSetup(event) {
        event.preventDefault();
        const val = id => document.getElementById(id).value.trim();
        const muscles = Array.from(document.querySelectorAll('[name="gym-muscles"]:checked')).map(el => el.value);
        const exercises = Array.from(document.querySelectorAll('[name="gym-exercises"]:checked')).map(el => el.value);
        const level = val('gym-level');
        const target = val('gym-goal');
        const minutes = val('gym-minutes');
        const details = [
            `Kinh nghiệm: ${level}. Mục tiêu: ${target}. Nơi tập: ${val('gym-place')}.`,
            `Calories hiện tại: ${val('gym-calories') || 'chưa biết'} kcal/ngày. Mục tiêu calories do người dùng cung cấp: ${val('gym-target-calories') || 'chưa có'}.`,
            `Ăn uống: ${val('gym-diet')}. Số bữa: ${val('gym-meals') || 'chưa cung cấp'}.`,
            `Nhóm cơ ưu tiên: ${muscles.join(', ') || 'phát triển cân đối toàn thân'}.`,
            `Bài muốn tập: ${exercises.join(', ') || 'chọn theo dụng cụ và kinh nghiệm'}.`,
            `Cân nặng: ${val('gym-weight') || 'chưa cung cấp'} kg. Protein hiện tại: ${val('gym-protein') || 'chưa biết'} g/ngày. Mục tiêu protein người dùng chọn: ${val('gym-protein-target') || 'chưa có'} g/ngày. Nguồn đạm: ${val('gym-protein-foods') || 'chưa cung cấp'}.`,
            'Mỗi buổi phải có tên bài cụ thể, nhóm cơ chính/phối hợp, số hiệp × số lần, nghỉ giữa hiệp, hướng dẫn kỹ thuật và cách tăng tiến. Với bài một tay, ghi số lần mỗi bên. Phân biệt teres major với teres minor; không hứa cô lập hoàn toàn một vùng cơ. Tôn trọng giới hạn vận động. Đưa gợi ý ghi mức tạ, số lần thực hiện, cảm nhận, calories và gram protein vào description của task; không tự tạo subtask; giải thích vai trò ăn đủ đạm và phục hồi. Không tự đặt mục tiêu dinh dưỡng cá nhân khi thiếu dữ liệu.',
            `Thông tin thêm: ${val('gym-context') || 'chưa cung cấp'}.`,
            'Tạo task cho tập luyện, ghi nhật ký ăn uống/calories thực tế và phục hồi. Mỗi task bài tập có description ghi số hiệp, số lần và thời gian nghỉ phù hợp. Không tự coi calories đang ăn là mục tiêu; khi thiếu dữ liệu, tạo bước ghi nhận ban đầu thay vì gán calories cá nhân hóa.'
        ].join('\n');
        this.applyDomainSetup('fitness', 'fitness-setup-modal', { level, target, minutes, days: val('gym-days'), details });
    },

    applyCodeSetup(event) {
        event.preventDefault();
        const val = id => document.getElementById(id)?.value?.trim() || '';
        const coreIdea = val('code-core-idea');
        const projectType = val('code-project');
        const target = coreIdea ? `${projectType}: ${coreIdea}` : projectType;
        const topics = Array.from(document.querySelectorAll('[name="code-topics"]:checked')).map(el => el.value);
        const process = val('code-process');
        const standards = Array.from(document.querySelectorAll('[name="code-standards"]:checked')).map(el => el.value);
        const details = [
            `Ý tưởng chính của dự án: ${coreIdea || 'chưa mô tả cụ thể; định hướng theo dự án đã chọn'}.`,
            `Nền tảng: ${val('code-platform')}. Môi trường triển khai: ${val('code-deployment')}. Hosting và giới hạn: ${val('code-hosting-details') || 'chưa cung cấp'}.`,
            `Trạng thái dự án: ${val('code-project-state')}. Tiến độ hiện tại và mục tiêu đợt tiếp theo: ${val('code-progress') || 'chưa cung cấp; hỏi phần còn thiếu trước khi suy đoán'}.`,
            'Điều chỉnh lộ trình theo nền tảng đã chọn, không ép Python/LM Studio/RAG nếu không liên quan. Với shared hosting, xác minh hỗ trợ runtime, phiên bản PHP, database, SSH/Composer, cron và giới hạn tài nguyên trước khi chọn stack; không mặc định có Node/Python server chạy nền, Docker hay quyền root. Có task setup local, cấu hình môi trường, database/migration, domain/DNS/HTTPS, deploy bằng phương thức hosting hỗ trợ, bảo vệ secrets ngoài web root, backup/restore và kiểm tra sau triển khai. Nếu stack không tương thích hosting, nêu phương án thay thế và để người dùng quyết định.',
            `Quy trình: ${process}. Chu kỳ sprint: ${val('code-sprint')}. Tiêu chuẩn ưu tiên: ${standards.join(', ') || 'chọn theo quy mô dự án'}.`,
            'Đưa backlog, user story, acceptance criteria, Definition of Done, planning, review và retrospective vào description của các task theo quy trình đã chọn. Với Scrum, giải thích vai trò và dùng phiên bản gọn cho người tự học; không ép đủ nghi thức nếu chọn Kanban. Thiết lập Git/PR review, kiểm thử, CI và tài liệu theo các chuẩn đã chọn. Phân biệt thực hành nội bộ với chứng nhận tuân thủ; không tuyên bố đạt ISO/GDPR/OWASP chỉ bằng checklist.',
            `Chủ đề: ${topics.join(', ') || 'nền tảng và kỹ năng phù hợp với dự án đã chọn'}.`,
            `Máy: ${val('code-os')}. Cấu hình: ${val('code-hardware') || 'chưa biết'}.`,
            `Ý tưởng thêm: ${val('code-context') || 'chưa có'}.`,
            'Lên lộ trình từ nền tảng đến dự án chạy được. Với Python, tạo khung thư mục, môi trường ảo, quản lý phụ thuộc và bài tập kiểm tra. Với LM Studio, có bước kiểm tra cấu hình máy và chạy model phù hợp. Với RAG, đi qua nhập tài liệu, chia đoạn, embeddings, truy xuất, trả lời kèm nguồn và đánh giá chất lượng. Mỗi task chính có description và tiêu chí nghiệm thu kiểm chứng được, không tự tạo subtask; giải thích code thay vì chỉ copy. Với công nghệ mới, kiểm tra tài liệu chính thức và phiên bản tại thời điểm lập kế hoạch, không tự bịa khả năng công cụ.'
        ].join('\n');
        this.applyDomainSetup('vibecode', 'code-setup-modal', { level: val('code-level'), target, minutes: val('code-minutes'), details });
    },

    openIeltsModal() {
        Ielts.updateType();
        document.getElementById('ielts-level-modal').showModal();
    },

    applyIeltsLevel(event) {
        event.preventDefault();
        const band = document.getElementById('ielts-band').value;
        const targetBand = document.getElementById('ielts-target-band')?.value || 'IELTS 6.5';
        const experience = document.getElementById('ielts-experience').value;
        const weak = Array.from(document.querySelectorAll('[name="ielts-weak"]:checked')).map(el => el.value);
        const extra = document.getElementById('ielts-context').value.trim();
        const level = [band, experience, weak.length ? 'Kỹ năng yếu: ' + weak.join(', ') : 'Chưa xác định kỹ năng yếu', extra].filter(Boolean).join('. ');
        document.getElementById('wiz-current-level').value = level;
        const target = `Đạt ${targetBand} (${band})`;
        document.getElementById('wiz-target-goal').value = target;
        this.domainDetails.ielts = {level, target, minutes:document.getElementById('wiz-minutes').value, details:Ielts.prompt()};
        document.getElementById('ielts-level-modal').close();
        document.getElementById('wiz-prompt-result-card').style.display = 'none';
        this.showToast('Đã chọn loại thi, trình độ, mục tiêu và dạng bài. Bấm Tạo Prompt để áp dụng.');
    },

    // --- Task Notes / Learning Journal (Nhật Ký Học & Báo Cáo) ---
    toggleTaskNote(taskId) {
        const drawer = document.getElementById(`task-note-drawer-${taskId}`);
        if (!drawer) return;
        const isHidden = drawer.style.display === 'none' || !drawer.style.display;
        drawer.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            const input = document.getElementById(`task-note-input-${taskId}`);
            if (input) input.focus();
        }
    },

    debouncedSaveTaskNote(taskId, noteText) {
        const statusEl = document.getElementById(`task-note-status-${taskId}`);
        if (statusEl) statusEl.textContent = 'Đang lưu...';

        clearTimeout(this.noteDebounceTimers[taskId]);
        this.noteDebounceTimers[taskId] = setTimeout(() => {
            this.saveTaskNoteNow(taskId, noteText).catch(() => {});
        }, 800);
    },

    async saveTaskNoteNow(taskId, noteText = null) {
        if (!this.currentPlanId) return;
        if (noteText === null) {
            const input = document.getElementById(`task-note-input-${taskId}`);
            noteText = input ? input.value : '';
        }

        clearTimeout(this.noteDebounceTimers[taskId]);
        const statusEl = document.getElementById(`task-note-status-${taskId}`);
        try {
            const token = this.getAuthToken(this.currentPlanId);

            // Find current task to keep status
            let currentStatus = 'pending';
            let actualMin = null;
            if (this.planData) {
                for (const w of Object.values(this.planData.weeks)) {
                    for (const d of Object.values(w.days)) {
                        for (const t of d.tasks) {
                            if (t.id === taskId) {
                                currentStatus = t.status;
                                actualMin = t.actual_minutes;
                                t.notes = noteText;
                                break;
                            }
                        }
                    }
                }
            }

            const res = await App.apiFetch('api.php?action=update_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Plan-Token': token
                },
                body: JSON.stringify({
                    p: this.currentPlanId,
                    task_id: taskId,
                    status: currentStatus,
                    actual_minutes: actualMin,
                    notes: noteText
                })
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error || 'Không lưu được ghi chú');
            if (data.success) {
                delete this.noteDebounceTimers[taskId];
                if (statusEl) statusEl.textContent = 'Đã lưu ✓';
                setTimeout(() => {
                    if (statusEl) statusEl.textContent = 'Đã lưu ghi chú';
                }, 2000);
                this.showToast('Đã lưu ghi chú học tập ✓');
            }
        } catch (e) {
            console.error(e);
            if (statusEl) statusEl.textContent = 'Lỗi lưu ghi chú — bấm Lưu ngay để thử lại';
            throw e;
        }
    },

    // --- Task Execution ---
    async toggleTaskStatus(taskId, currentStatus) {
        const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        await this.updateTask(taskId, nextStatus);
    },

    async updateTask(taskId, status, actualMinutes = null, notes = null) {
        if (!this.currentPlanId) return;

        try {
            const token = this.getAuthToken(this.currentPlanId);
            const res = await App.apiFetch('api.php?action=update_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Plan-Token': token
                },
                body: JSON.stringify({
                    p: this.currentPlanId,
                    task_id: taskId,
                    status: status,
                    actual_minutes: actualMinutes,
                    notes: notes
                })
            });
            const data = await res.json();

            if (data.success) {
                this.updateLocalTaskState(taskId, status, actualMinutes, data.stats);
                this.renderDailyView();
                this.renderFooterProgress();
                this.renderStatsView();

                if (status === 'completed') {
                    this.showToast('Đã hoàn thành bài học! ✓');
                }
            } else if (res.status === 401) {
                this.showToast('Cần mật khẩu để cập nhật nhiệm vụ');
                this.showLockScreen(this.planData ? this.planData.title : 'Kế Hoạch Được Khóa');
            }
        } catch (e) {
            console.error(e);
            this.showToast('Lỗi cập nhật nhiệm vụ');
        }
    },

    updateLocalTaskState(taskId, status, actualMinutes, newStats) {
        if (!this.planData) return;
        for (const week of Object.values(this.planData.weeks)) {
            for (const day of Object.values(week.days)) {
                for (const t of day.tasks) {
                    if (t.id === taskId) {
                        t.status = status;
                        if (actualMinutes !== null) t.actual_minutes = actualMinutes;
                        break;
                    }
                }
            }
        }
        if (newStats) {
            this.planData.stats = newStats;
        }
    },

    // --- Focus Timer ---
    startTimerForTask(taskId, title, durationMinutes) {
        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
        }

        this.timer.taskId = taskId;
        this.timer.taskTitle = title;
        this.timer.totalSecs = durationMinutes * 60;
        this.timer.remainingSecs = this.timer.totalSecs;
        this.timer.isRunning = true;

        this.updateTimerDisplay();
        document.getElementById('focus-timer-card').style.display = 'flex';

        this.timer.intervalId = setInterval(() => {
            if (this.timer.remainingSecs > 0) {
                this.timer.remainingSecs--;
                this.updateTimerDisplay();
            } else {
                clearInterval(this.timer.intervalId);
                this.timer.isRunning = false;
                this.playTimerChime();
                this.updateTimerDisplay();
                alert(`Hoàn thành phiên tập trung: ${this.timer.taskTitle}! Xuất sắc.`);
                this.updateTask(this.timer.taskId, 'completed', Math.round(this.timer.totalSecs / 60));
            }
        }, 1000);

        this.showToast(`Bắt đầu đếm giờ: ${durationMinutes} phút tập trung`);
    },

    toggleTimerPause() {
        if (!this.timer.taskId) return;
        const btn = document.getElementById('timer-pause-btn');

        if (this.timer.isRunning) {
            clearInterval(this.timer.intervalId);
            this.timer.isRunning = false;
            if (btn) btn.textContent = 'Tiếp tục';
            this.showToast('Đã tạm dừng');
        } else {
            this.timer.isRunning = true;
            if (btn) btn.textContent = 'Tạm dừng';
            this.timer.intervalId = setInterval(() => {
                if (this.timer.remainingSecs > 0) {
                    this.timer.remainingSecs--;
                    this.updateTimerDisplay();
                } else {
                    clearInterval(this.timer.intervalId);
                    this.timer.isRunning = false;
                    this.playTimerChime();
                    this.updateTimerDisplay();
                    this.updateTask(this.timer.taskId, 'completed', Math.round(this.timer.totalSecs / 60));
                }
            }, 1000);
            this.showToast('Tiếp tục tập trung');
        }
    },

    resetTimer() {
        if (this.timer.intervalId) clearInterval(this.timer.intervalId);
        this.timer.remainingSecs = this.timer.totalSecs;
        this.timer.isRunning = false;
        this.updateTimerDisplay();
        const btn = document.getElementById('timer-pause-btn');
        if (btn) btn.textContent = 'Bắt đầu';
    },

    finishTimerEarly() {
        if (!this.timer.taskId) return;
        const elapsedSecs = this.timer.totalSecs - this.timer.remainingSecs;
        const elapsedMinutes = Math.max(1, Math.round(elapsedSecs / 60));
        clearInterval(this.timer.intervalId);
        this.timer.isRunning = false;
        this.updateTask(this.timer.taskId, 'completed', elapsedMinutes);
        document.getElementById('focus-timer-card').style.display = 'none';
        this.showToast('Hoàn thành sớm & đánh dấu xong!');
    },

    updateTimerDisplay() {
        const titleEl = document.getElementById('timer-task-title');
        const digitsEl = document.getElementById('timer-digits');
        const pauseBtn = document.getElementById('timer-pause-btn');

        if (titleEl) titleEl.textContent = this.timer.taskTitle || 'Chưa chọn phiên';

        const mins = Math.floor(this.timer.remainingSecs / 60);
        const secs = this.timer.remainingSecs % 60;
        if (digitsEl) {
            digitsEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        if (pauseBtn) {
            pauseBtn.textContent = this.timer.isRunning ? 'Tạm dừng' : 'Tiếp tục';
        }
    },

    playTimerChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('Audio chime not supported');
        }
    },

    // --- Date Navigation ---
    getAllPlanDates() {
        if (!this.planData || !this.planData.weeks) return [];
        const dates = [];
        for (const w of Object.values(this.planData.weeks)) {
            for (const d of Object.values(w.days)) {
                if (d.date) dates.push(d.date);
            }
        }
        return dates.sort();
    },

    navigateDate(direction) {
        const allDates = this.getAllPlanDates();
        if (allDates.length === 0) return;

        const currentIndex = allDates.indexOf(this.selectedDate);
        if (direction === 'prev' && currentIndex > 0) {
            this.selectedDate = allDates[currentIndex - 1];
        } else if (direction === 'next' && currentIndex < allDates.length - 1) {
            this.selectedDate = allDates[currentIndex + 1];
        } else if (direction === 'today') {
            const todayStr = this.today();
            this.selectedDate = allDates.includes(todayStr) ? todayStr : allDates[0];
        }
        this.renderDailyView();
    },

    // --- Rendering ---
    renderAll() {
        if (!this.planData) return;

        const titleBadge = document.getElementById('plan-title-display');
        const linkSlug = document.getElementById('dynamic-link-slug');
        if (titleBadge) titleBadge.textContent = this.planData.title;
        if (linkSlug) linkSlug.textContent = `/${this.planData.plan_id}`;

        this.updatePasswordBadge();
        const finance = this.planData.domain === 'finance';
        const notebook = this.planData.domain === 'notebook';
        Workspace.renderNotebook();
        document.body.classList.toggle('finance-mode', finance);
        document.querySelector('[data-tab="today"] .nav-label').textContent = finance ? 'Thu chi & FIRE' : notebook ? 'Ghi chú' : 'Hôm nay';
        document.getElementById('export-label').textContent = finance ? 'Xuất dữ liệu tài chính' : notebook ? 'Xuất ghi chú Markdown' : 'Xuất PLAN.md + nhật ký';
        Finance.render();
        if (finance || notebook) return;
        this.renderDailyView();
        this.renderTocView();
        this.renderStatsView();
        this.renderFooterProgress();
    },

    renderDailyView() {
        if (!this.planData || this.planData.domain === 'finance') return;

        const dayInfo = this.findDayByDate(this.selectedDate);
        const chapterTitle = document.getElementById('chapter-title');
        const chapterSub = document.getElementById('chapter-sub');
        const tasksContainer = document.getElementById('daily-tasks-list');
        const dateDisplay = document.getElementById('current-date-display');

        const formattedDate = new Date(this.selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (dateDisplay) dateDisplay.textContent = formattedDate;

        if (!dayInfo) {
            if (chapterTitle) chapterTitle.textContent = 'Ngày Nghỉ / Không Có Lịch';
            if (chapterSub) chapterSub.textContent = `Ngày: ${this.selectedDate}`;
            if (tasksContainer) {
                tasksContainer.innerHTML = `<div class="empty-day-state">Không có bài học trong ngày này. Hãy chọn ngày khác hoặc nghỉ ngơi phục hồi năng lượng nhé!</div>`;
            }
            return;
        }

        const { weekNum, dayName, day } = dayInfo;
        if (chapterTitle) chapterTitle.textContent = `${day.day_name || dayName}`;
        if (chapterSub) {
            chapterSub.innerHTML = `<span>Tuần ${weekNum} / ${this.planData.duration_weeks}</span><span>Kế hoạch: ${day.tasks.reduce((sum, t) => sum + (t.duration || 0), 0)} phút</span>`;
        }

        if (tasksContainer) {
            tasksContainer.innerHTML = '';
            if (!day.tasks || day.tasks.length === 0) {
                tasksContainer.innerHTML = `<div class="empty-day-state">Hôm nay không có nhiệm vụ. Tự do học tập!</div>`;
                return;
            }

            day.tasks.forEach(task => {
                const item = document.createElement('div');
                const typeKey = (task.type || 'custom').toLowerCase();
                item.className = `task-item task-type-${typeKey} ${task.status === 'completed' ? 'completed' : ''}`;
                item.style.flexDirection = 'column';

                const typeClass = `hl-${task.type || 'custom'}`;
                const priorityClass = task.priority === 'high' ? 'priority-high' : '';

                item.innerHTML = `
                    <div style="display:flex; align-items:flex-start; gap:1rem; width:100%;">
                        <button class="task-checkbox-btn" title="Đánh dấu hoàn thành" onclick="App.toggleTaskStatus('${task.id}', '${task.status}')">
                            ${task.status === 'completed' ? '✓' : ''}
                        </button>
                        <div class="task-content">
                            <div class="task-meta-top">
                                <span class="highlighter-pill ${typeClass}">${task.type}</span>
                                <span class="task-duration-badge"> ${task.duration} min</span>
                                ${task.priority ? `<span class="priority-badge ${priorityClass}">[${task.priority}]</span>` : ''}
                                ${task.target ? `<span class="task-duration-badge">Target: ${task.target} ${task.unit || ''}</span>` : ''}
                            </div>
                            <div class="task-title-wrap" id="task-title-wrap-${task.id}">
                                <span class="task-title" id="task-title-${task.id}">${this.escapeHtml(task.title)}</span>
                                <button type="button" class="btn-task-rename" title="Đổi tên nhiệm vụ" aria-label="Đổi tên ${this.escapeHtml(task.title)}" onclick="App.startRenameTask('${task.id}')">
                                    ${(typeof Icons !== 'undefined' && Icons.svg) ? Icons.svg('edit') : '✎'}
                                </button>
                            </div>

                        </div>
                        <div class="task-actions">
                            <select class="status-select" onchange="App.updateTask('${task.id}', this.value)">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="skipped" ${task.status === 'skipped' ? 'selected' : ''}>Skipped</option>
                                <option value="failed" ${task.status === 'failed' ? 'selected' : ''}>Failed</option>
                            </select>
                            <button class="btn-start-task" title="Bắt đầu đếm giờ" onclick="App.startTimerForTask('${task.id}', '${this.escapeHtml(task.title)}', ${task.duration})">
                                 Focus
                            </button>

                        </div>
                    </div>

                `;
                Journal.renderTask(task, item);
                this.renderSubtasks(task, item);
                tasksContainer.appendChild(item);
            });
        }
    },

    findDayByDate(dateStr) {
        if (!this.planData || !this.planData.weeks) return null;
        for (const [wNum, w] of Object.entries(this.planData.weeks)) {
            for (const [dKey, d] of Object.entries(w.days)) {
                if (d.date === dateStr) {
                    return { weekNum: wNum, dayName: dKey, day: d };
                }
            }
        }
        return null;
    },

    renderTocView() {
        const container = document.getElementById('toc-container');
        if (!container || !this.planData) return;

        container.innerHTML = '';

        for (const [wNum, week] of Object.entries(this.planData.weeks)) {
            const block = document.createElement('div');
            block.className = 'toc-week-block';

            let daysHtml = '';
            for (const [dKey, day] of Object.entries(week.days)) {
                const totalMins = day.tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
                const completedMins = day.tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.duration || 0), 0);

                daysHtml += `
                    <div class="toc-day-row">
                        <div class="toc-day-title" style="display:flex; justify-content:space-between; align-items:center;">
                            <a href="#" onclick="App.jumpToDate('${day.date}'); return false;" style="color:var(--ink-primary); font-weight:600; text-decoration:none;">
                                 ${day.day_name} (${day.date})
                            </a>
                            <span style="font-size:0.8rem; color:var(--ink-muted); font-family:var(--font-mono);">
                                ${completedMins}/${totalMins} min
                            </span>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.3rem;">
                            ${day.tasks.map(t => `
                                <span class="highlighter-pill hl-${t.type}" style="font-size:0.7rem; opacity:${t.status === 'completed' ? '0.6' : '1'}; text-decoration:${t.status === 'completed' ? 'line-through' : 'none'};">
                                    ${t.status === 'completed' ? '✓ ' : ''}${this.escapeHtml(t.title)} (${t.duration}m)
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            block.innerHTML = `
                <div class="toc-week-header">
                    <span>Week ${wNum}</span>
                    <span style="font-size:0.85rem; font-weight:normal; color:var(--ink-muted);">
                        ${Object.keys(week.days).length} Active Days
                    </span>
                </div>
                <div class="toc-week-body">
                    ${daysHtml}
                </div>
            `;
            container.appendChild(block);
        }
    },

    jumpToDate(dateStr) {
        this.selectedDate = dateStr;
        this.switchTab('today');
        this.renderDailyView();
    },

    renderStatsView() {
        if (!this.planData || !this.planData.stats) return;
        const s = this.planData.stats;

        const rateEl = document.getElementById('stat-completion-rate');
        const tasksEl = document.getElementById('stat-completed-tasks');
        const timeEl = document.getElementById('stat-time-spent');
        const streakEl = document.getElementById('stat-streak');

        if (rateEl) rateEl.textContent = `${s.completion_rate}%`;
        if (tasksEl) tasksEl.textContent = `${s.completed} / ${s.total_tasks}`;
        if (timeEl) timeEl.textContent = `${Math.round(s.actual_minutes_total / 60)}h ${s.actual_minutes_total % 60}m`;
        if (streakEl) streakEl.textContent = `${s.streak} Days`;

        this.fetchAiPrompt();
    },

    async fetchAiPrompt() {
        if (!this.currentPlanId) return;
        try {
            const token = this.getAuthToken(this.currentPlanId);
            const res = await App.apiFetch(`api.php?action=get_adaptation_prompt&p=${encodeURIComponent(this.currentPlanId)}`, {
                headers: { 'X-Plan-Token': token }
            });
            const data = await res.json();
            const textarea = document.getElementById('ai-adaptation-prompt-box');
            if (textarea && data.success) {
                textarea.value = data.prompt;
            }
        } catch (e) {
            console.error(e);
        }
    },

    renderFooterProgress() {
        if (!this.planData || !this.planData.stats) return;
        const s = this.planData.stats;

        const locEl = document.getElementById('footer-loc');
        const barEl = document.getElementById('footer-progress-bar');
        const pctEl = document.getElementById('footer-pct');

        if (locEl) locEl.textContent = `Completed: ${s.completed} of ${s.total_tasks} tasks`;
        if (barEl) barEl.style.width = `${s.completion_rate}%`;
        if (pctEl) pctEl.textContent = `${s.completion_rate}% done`;
    },

    // --- Tab Switching ---
    switchTab(tabId) {
        if (this.isLocked) return;
        if (!this.planData && ['today','toc','stats'].includes(tabId)) tabId = 'wizard';
        if (['finance','notebook'].includes(this.planData?.domain) && ['toc','import','stats','guide'].includes(tabId)) tabId = 'today';
        this.activeTab = tabId;

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
        });

        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `view-${tabId}`);
        });

        if (tabId === 'stats') {
            this.renderStatsView();
        } else if (tabId === 'toc') {
            this.renderTocView();
        }
    },

    // --- Clipboard & Sharing ---
    copyDynamicLink() {
        if (!this.currentPlanId) return;
        const fullUrl = this.planUrl(this.currentPlanId);

        navigator.clipboard.writeText(fullUrl).then(() => {
            this.showToast('Đã copy dynamic link! Lưu lại để mở bất kỳ lúc nào.');
        }).catch(() => {
            prompt('Copy dynamic link này:', fullUrl);
        });
    },

    copyAiPrompt() {
        const textarea = document.getElementById('ai-adaptation-prompt-box');
        if (!textarea || !textarea.value) return;

        navigator.clipboard.writeText(textarea.value).then(() => {
            this.showToast('Đã copy prompt thích ứng! Dán vào ChatGPT hoặc Gemini.');
        });
    },

    showToast(message) {
        let toast = document.getElementById('ereader-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ereader-toast';
            toast.className = 'toast-msg';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // --- Plan Saving & Import ---
    async loadExamplePlan(exampleName, autoSave = false) {
        try {
            const res = await App.apiFetch(`api.php?action=load_example&name=${encodeURIComponent(exampleName)}`);
            const data = await res.json();
            if (!data.success || !data.markdown) {
                this.showToast('Không tải được kế hoạch mẫu');
                return;
            }

            if (autoSave) {
                await this.savePlanMarkdown(data.markdown);
            } else {
                const textarea = document.getElementById('import-markdown');
                if (textarea) textarea.value = data.markdown;
                this.switchTab('import');
                this.previewMarkdown(data.markdown);
                this.showToast('Đã nạp mẫu vào khung soạn thảo. Bấm "Import" để kích hoạt.');
            }
        } catch (e) {
            console.error(e);
        }
    },

    async savePlanMarkdown(markdown, customId = null, password = null) {
        try {
            this.showToast('Đang lưu kế hoạch...');
            const res = await App.apiFetch('api.php?action=save_plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Plan-Token': this.getAuthToken(customId || this.currentPlanId) },
                body: JSON.stringify({ markdown, custom_id: customId || this.currentPlanId, password: password || null })
            });
            const data = await res.json();

            if (!data.success) {
                const errMsgs = (data.errors || []).join('\n');
                alert('Kiểm tra định dạng PLAN.md không thành công:\n\n' + errMsgs);
                return;
            }

            if (data.token) {
                this.setAuthToken(data.plan_id, data.token);
            }

            this.showToast('Kế hoạch đã lưu thành công!');
            await this.loadPlan(data.plan_id);
            this.switchTab('today');
        } catch (e) {
            console.error(e);
            this.showToast('Lỗi lưu kế hoạch');
        }
    },

    // --- Event Bindings ---
    bindEvents() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        const fontMinus = document.getElementById('btn-font-minus');
        const fontPlus = document.getElementById('btn-font-plus');
        if (fontMinus) fontMinus.addEventListener('click', () => this.adjustFontSize(-1));
        if (fontPlus) fontPlus.addEventListener('click', () => this.adjustFontSize(1));

        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('plan-file-input');
        if (dropzone && fileInput) {
            dropzone.addEventListener('click', () => fileInput.click());
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const md = evt.target.result;
                        document.getElementById('import-markdown').value = md;
                        this.previewMarkdown(md);
                    };
                    reader.readAsText(file);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const md = evt.target.result;
                        document.getElementById('import-markdown').value = md;
                        this.previewMarkdown(md);
                    };
                    reader.readAsText(file);
                }
            });
        }

        const importTextarea = document.getElementById('import-markdown');
        if (importTextarea) {
            let debounceTimer;
            importTextarea.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.previewMarkdown(importTextarea.value);
                }, 400);
            });
        }

        const wizPasteTextarea = document.getElementById('wiz-paste-markdown');
        if (wizPasteTextarea) {
            let debounceTimer;
            wizPasteTextarea.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.previewMarkdown(wizPasteTextarea.value, 'wiz-import-preview-box');
                }, 400);
            });
        }
    },

    async previewMarkdown(markdown, targetBoxId = 'import-preview-box') {
        if (!markdown || !markdown.trim()) return;
        try {
            const res = await App.apiFetch('api.php?action=validate_preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown })
            });
            const data = await res.json();
            const previewBox = document.getElementById(targetBoxId);

            if (!previewBox) return;

            if (data.valid) {
                previewBox.style.display = 'block';
                previewBox.style.border = '1px solid var(--hl-green-ink)';
                previewBox.style.background = 'var(--bg-page)';
                const p = data.plan_preview;
                previewBox.innerHTML = `
                    <div style="font-weight:700; color:var(--hl-green-ink); margin-bottom:0.35rem;">✓ File PLAN.md Hợp Lệ</div>
                    <div style="font-size:0.85rem; line-height:1.5;">
                        <strong>Tiêu đề:</strong> ${this.escapeHtml(p.title)}<br>
                        <strong>Ngày bắt đầu:</strong> ${p.start_date} • <strong>Thời lượng:</strong> ${p.duration_weeks} tuần<br>
                        <strong>Nhiệm vụ:</strong> ${p.task_count} nhiệm vụ (${p.total_minutes} phút tổng)
                    </div>
                `;
            } else {
                previewBox.style.display = 'block';
                previewBox.style.border = '1px solid var(--hl-rose-ink)';
                previewBox.style.background = 'var(--bg-page)';
                previewBox.innerHTML = `
                    <div style="font-weight:700; color:var(--hl-rose-ink); margin-bottom:0.35rem;"> Lỗi Định Dạng PLAN.md:</div>
                    <ul style="font-size:0.85rem; padding-left:1.2rem; color:var(--ink-secondary);">
                        ${(data.errors || []).map(e => `<li>${this.escapeHtml(e)}</li>`).join('')}
                    </ul>
                `;
            }
        } catch (e) {
            console.error(e);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
