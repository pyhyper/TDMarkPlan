const Workspace = {
    slot: 1,
    summaries: [],
    busy: false,
    noteDraft: null,
    init() {
        this.slot = new URL(location.href).searchParams.get('slot') === '2' ? 2 : 1;
        for (const slot of [1,2]) {
            document.getElementById(`plan-summary-${slot}`).addEventListener('click', async event => {
                if (this.slot === slot) return;
                event.preventDefault();
                await this.select(slot);
            });
        }
    },
    render(items) {
        document.getElementById('btn-edit-link').disabled = App.isLocked;
        if (items) this.summaries = items;
        const available = this.summaries.some(p => p.exists);
        // Only 1 plan is displayed at a time on screen
        const deck = document.getElementById('workspace-deck');
        if (deck) deck.hidden = true;
        const surface = document.getElementById('plan-surface');
        const singleHost = document.getElementById('single-plan-host');
        if (singleHost && surface) singleHost.append(surface);

        for (const slot of [1,2]) {
            const info = this.summaries.find(p=>p.slot === slot);
            const titleEl = document.getElementById(`plan-title-${slot}`);
            if (titleEl) titleEl.textContent = info?.exists ? info.title : 'Thêm plan thứ hai';
            const cardEl = document.getElementById(`plan-card-${slot}`);
            if (cardEl) cardEl.open = slot === this.slot;
        }

        const slotLabel = document.getElementById('plan-slot-label');
        if (slotLabel) slotLabel.textContent = available ? `Đang thiết lập plan ${this.slot}/2` : 'Tạo plan đầu tiên';
        for (const id of ['wiz-password','finance-pin']) {
            const field = document.getElementById(id);
            if (field) {
                field.disabled = this.slot === 2;
                if (this.slot === 2) { field.value = ''; field.placeholder = 'Dùng chung PIN của link'; }
            }
        }
        if (App.updateHeaderPlanLabel) App.updateHeaderPlanLabel();
        if (App.renderModalPlans && (document.getElementById('plan-modal')?.open || document.getElementById('notes-modal')?.open)) {
            App.renderModalPlans();
        }
    },
    async flush() {
        await Journal.flush();
        for (const id of Object.keys(App.subtaskDrafts)) await App.saveSubtasks(id);
        await Promise.all(Object.values(App.subtaskQueues));
        if (this.noteDraft !== null) await this.saveNotes();
    },
    async select(slot) {
        if (this.busy || App.isLocked || slot === this.slot) return;
        this.busy = true;
        document.getElementById('plan-surface').inert = true;
        try {
            await this.flush();
            if (App.planData?.domain === 'finance') {
                const input = document.getElementById('finance-analysis');
                if (input.value !== (App.planData.finance.analysis || '')) await Finance.save({...App.planData.finance, analysis:input.value});
            }
            App.resetTimer();
            this.slot = slot;
            App.planData = null;
            App.subtaskDrafts = {}; App.subtaskQueues = {}; Journal.drafts = {}; Journal.queues = {};
            this.noteDraft = null;
            document.getElementById('wiz-paste-markdown').value = '';
            document.getElementById('import-markdown').value = '';
            document.getElementById('blank-plan-title').value = '';
            document.getElementById('daily-tasks-list').replaceChildren();
            document.getElementById('notebook-notes').replaceChildren();
            document.getElementById('notebook-content').hidden = true;
            document.getElementById('finance-dashboard').hidden = true;
            document.getElementById('finance-analysis').value = '';
            Finance.draft = null;
            document.body.classList.remove('finance-mode', 'notebook-mode');
            await App.loadPlan(App.currentPlanId);
            this.render();
        } catch(e) { App.showToast(e.message); }
        finally { this.busy = false; document.getElementById('plan-surface').inert = false; }
    },
    async createNotebook(button) {
        if (App.planData) { App.showToast('Chọn ô plan còn trống để tạo sổ ghi chú.'); return; }
        button.disabled = true;
        try {
            const autoDelVal = document.getElementById('blank-plan-auto-delete')?.value;
            const autoDel = autoDelVal !== undefined && autoDelVal !== '' ? parseInt(autoDelVal, 10) : 90;
            const response = await App.apiFetch('api.php?action=create_notebook', {
                method:'POST',
                headers:{'Content-Type':'application/json','X-Plan-Token':App.getAuthToken(App.currentPlanId)},
                body:JSON.stringify({
                    p:App.currentPlanId,
                    title:document.getElementById('blank-plan-title').value.trim() || 'Sổ ghi chú',
                    password:document.getElementById('wiz-password').value || null,
                    auto_delete_days: autoDel
                })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Không tạo được sổ ghi chú');
            App.setAuthToken(App.currentPlanId,data.token);
            if (autoDel >= 0) {
                await App.apiFetch('api.php?action=set_auto_delete', {method:'POST', headers:{'Content-Type':'application/json','X-Plan-Token':data.token}, body:JSON.stringify({p:App.currentPlanId, days:autoDel})});
            }
            await App.loadPlan(App.currentPlanId);
        } catch(e) { App.showToast(e.message); }
        finally { button.disabled = false; }
    },
    renderNotebook() {
        const active = App.planData?.domain === 'notebook';
        document.body.classList.toggle('notebook-mode',active);
        document.getElementById('notebook-content').hidden = !active;
        if (!active) return;
        document.getElementById('notebook-title').textContent = App.planData.title;
        const host=document.getElementById('notebook-notes'); host.replaceChildren();
        Journal.renderCards(host, this.noteDraft ?? App.planData.notebook?.notes ?? [], cards=>{this.noteDraft=cards;}, ()=>this.saveNotes(), App.planData.title);
    },
    async saveNotes() {
        if (this.noteDraft === null) return;
        const snapshot = this.noteDraft.slice();
        const response = await App.apiFetch('api.php?action=save_notebook', {method:'POST', headers:{'Content-Type':'application/json','X-Plan-Token':App.getAuthToken(App.currentPlanId)}, body:JSON.stringify({p:App.currentPlanId,notes:snapshot})});
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Không lưu được ghi chú');
        App.planData.notebook = {notes:snapshot};
        if (JSON.stringify(snapshot) === JSON.stringify(this.noteDraft)) this.noteDraft = null;
    },
    async exportNotes() {
        await this.saveNotes();
        const text = `# ${App.planData.title}\n\nNgày xuất: ${App.today()}\n\n` + (App.planData.notebook?.notes || []).map((n,i)=>`## Ghi chú ${i+1}\n\n${n}`).join('\n\n');
        const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download=`${App.currentPlanId}-plan-${this.slot}-notes.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
};
