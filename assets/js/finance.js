const FireMath = {
    calculate(data, month) {
        const net = Math.max(0, data.assets - data.debt);
        const safety = data.essential * data.months;
        const independence = data.essential * 12 / (data.rate / 100);
        const freedom = data.lifestyle * 12 / (data.rate / 100);
        const entries = data.entries.filter(e => e.date.slice(0, 7) === month);
        const income = entries.filter(e => e.type === 'income').reduce((s,e) => s + Number(e.amount), 0);
        const expense = entries.filter(e => e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0);
        return {net, safety, independence, freedom, income, expense, balance: income - expense, savingsRate: income > 0 ? (income - expense) / income * 100 : null};
    }
};
if (typeof module !== 'undefined') module.exports = FireMath;
const Finance = {
    draft: null,
    editing: false,
    fields: ['essential','lifestyle','reserve','assets','debt','months','rate'],
    questions: ['goal','habit','stability','horizon','question'],
    open(editing = false) {
        this.editing = editing;
        const data = (editing ? App.planData?.finance : this.draft) || {};
        this.fields.forEach(key => { document.getElementById('fire-' + key).value = data[key] ?? ({months:6,rate:4}[key] ?? ''); });
        document.getElementById('fire-notes').value = data.notes || '';
        this.questions.forEach(key => {
            const input = document.getElementById('fire-' + key);
            if (data.profile?.[key]) input.value = data.profile[key];
            else if (input.tagName === 'SELECT') input.selectedIndex = 0;
            else input.value = '';
        });
        document.getElementById('fire-modal').showModal();
    },
    async apply(event) {
        event.preventDefault();
        const old = (this.editing ? App.planData.finance : this.draft) || {};
        const data = {entries: old.entries || [], notes: document.getElementById('fire-notes').value, analysis: old.analysis || '', profile:{}};
        this.questions.forEach(key => { data.profile[key] = document.getElementById('fire-' + key).value; });
        this.fields.forEach(key => { data[key] = Number(document.getElementById('fire-' + key).value); });
        if (data.lifestyle < data.essential) return App.showToast('Mức sống mong muốn cần bằng hoặc lớn hơn chi phí thiết yếu.');
        const button = event.submitter;
        button.disabled = true;
        try {
            if (this.editing) { await this.save(data); this.render(); }
            else {
                this.draft = data;
                document.getElementById('finance-setup-summary').textContent = `${data.profile.goal} · ${data.profile.habit} · ${data.profile.stability}. Sẵn sàng tạo bảng thu chi.`;
                document.getElementById('btn-start-finance').hidden = false;
            }
            document.getElementById('fire-modal').close();
        } catch(e) { App.showToast(e.message); }
        finally { button.disabled = false; }
    },
    async start(button) {
        if (!this.draft) return this.open();
        button.disabled = true;
        try {
            if (App.planData) throw new Error('Chọn ô plan còn trống để tạo bảng tài chính.');
            const id = App.currentPlanId;
            const res = await App.apiFetch('api.php?action=create_finance', {
                method:'POST',
                headers:{'Content-Type':'application/json','X-Plan-Token':App.getAuthToken(id)},
                body:JSON.stringify({p:id,finance:this.draft,password:document.getElementById('finance-pin').value || null})
            });
            const result = await res.json();
            if (!result.success) throw new Error((result.errors || [result.error]).join(' '));
            if (result.token) App.setAuthToken(result.plan_id,result.token);
            await App.loadPlan(result.plan_id);
        } catch(e) { App.showToast(e.message); }
        finally { button.disabled = false; }
    },
    async save(data) {
        const res = await App.apiFetch('api.php?action=save_finance', {method:'POST',headers:{'Content-Type':'application/json','X-Plan-Token':App.getAuthToken(App.currentPlanId)},body:JSON.stringify({p:App.currentPlanId,finance:data})});
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Không lưu được nhật ký');
        App.planData.finance = result.finance;
        App.showToast('Đã lưu tài chính');
    },
    generatePrompt() {
        const data = App.planData?.domain === 'finance' ? App.planData.finance : this.draft;
        if (!data) return this.open();
        const content = `Hãy phân tích tài chính cá nhân bằng tiếng Việt dựa trên dữ liệu tôi cung cấp. Ngày hiện tại: ${App.today()}. Đơn vị: VND.\n${JSON.stringify(data, null, 2)}\n\nBắt đầu bằng câu hỏi làm rõ nếu thiếu dữ liệu. Tóm tắt thói quen thu chi, dòng tiền theo tháng, nhu cầu dự phòng, nợ và các mốc FIRE theo giả định đã nhập. Đề xuất ngân sách và định hướng kèm lý do, ưu tiên theo mục tiêu tôi chọn. Không tự suy ra lợi nhuận, không cam kết ngày nghỉ hưu, không khẳng định mức rút tiền chắc chắn an toàn. Trả lời bằng các đoạn phân tích, bảng ngân sách và câu hỏi trao đổi; không tạo todo, checklist, YAML hay PLAN.md.`;
        document.getElementById('finance-ai-prompt').value = content;
        return content;
    },
    async copyPrompt() {
        const content = this.generatePrompt();
        if (!content) return;
        try { await navigator.clipboard.writeText(content); App.showToast('Đã copy prompt tài chính'); }
        catch (e) { document.getElementById('finance-ai-prompt').select(); App.showToast('Chọn và copy nội dung trong ô prompt.'); }
    },
    async saveAnalysis(button) {
        button.disabled = true;
        const status = document.getElementById('finance-analysis-status');
        try {
            await this.save({...App.planData.finance, analysis:document.getElementById('finance-analysis').value});
            status.textContent = 'Đã lưu';
        } catch (e) { status.textContent = e.message; }
        finally { button.disabled = false; }
    },
    exportData() {
        const url = URL.createObjectURL(new Blob([JSON.stringify({exported_at:new Date().toISOString(), ...App.planData.finance},null,2)], {type:'application/json'}));
        const a = document.createElement('a'); a.href = url; a.download = `${App.currentPlanId}-finance.json`; a.click();
        setTimeout(() => URL.revokeObjectURL(url),1000);
    },
    async addEntry(event) {
        event.preventDefault();
        const button = event.submitter;
        button.disabled = true;
        try {
            const data = JSON.parse(JSON.stringify(App.planData.finance));
            data.entries.push({date:document.getElementById('money-date').value,type:document.getElementById('money-type').value,amount:Number(document.getElementById('money-amount').value),category:document.getElementById('money-category').value.trim(),notes:document.getElementById('money-note').value.trim()});
            await this.save(data);
            document.getElementById('money-month').value = document.getElementById('money-date').value.slice(0,7);
            event.target.reset();
            this.render();
        } catch(e) { App.showToast(e.message); }
        finally { button.disabled = false; }
    },
    render() {
        const panel = document.getElementById('finance-dashboard');
        const data = App.planData?.finance;
        panel.hidden = App.planData?.domain !== 'finance';
        if (panel.hidden) return;
        document.body.classList.toggle('finance-mode', !panel.hidden);
        document.getElementById('finance-content').hidden = !data;
        if (!data) return;
        const profile = data.profile || {};
        document.getElementById('finance-profile-summary').textContent = [profile.goal,profile.habit,profile.stability,profile.horizon,profile.question].filter(Boolean).join('\n') || 'Chưa trả lời câu hỏi tài chính. Chọn Cập nhật để bổ sung.';
        if (document.activeElement !== document.getElementById('finance-analysis')) document.getElementById('finance-analysis').value = data.analysis || '';
        const monthInput = document.getElementById('money-month');
        if (!monthInput.value) monthInput.value = App.today().slice(0,7);
        document.getElementById('money-date').value ||= App.today();
        const result = FireMath.calculate(data, monthInput.value);
        const money = value => new Intl.NumberFormat('vi-VN', {style:'currency',currency:'VND',maximumFractionDigits:0}).format(value);
        const bars = document.getElementById('fire-bars');
        bars.replaceChildren();
        [['An toàn · Quỹ dự phòng',data.reserve,result.safety],['Độc lập · Chi phí thiết yếu',result.net,result.independence],['Tự do · Mức sống mong muốn',result.net,result.freedom]].forEach(([title,current,target]) => {
            const card = document.createElement('div'); card.className='fire-card';
            const label = document.createElement('strong'); label.textContent=title;
            const pct = target > 0 ? current / target * 100 : 0;
            const progress = document.createElement('progress'); progress.max=100;progress.value=Math.min(100,pct);progress.setAttribute('aria-label',title);
            const caption=document.createElement('p'); caption.textContent=`${pct.toFixed(1)}% · ${money(current)} / ${money(target)}`;
            card.append(label,progress,caption);bars.append(card);
        });
        document.getElementById('fire-assumptions').textContent=`Quỹ dự phòng = ${data.months} tháng × chi phí thiết yếu. Mốc FIRE = chi phí tháng × 12 ÷ ${(data.rate/100).toFixed(3)}. Tài sản đầu tư ròng = tài sản đầu tư − nợ; không tính quỹ dự phòng hai lần. Đây là kịch bản tham khảo, chưa mô phỏng thuế, lạm phát hay biến động thị trường.`;
        document.getElementById('finance-note-display').textContent=data.notes;
        document.getElementById('cashflow-summary').textContent=`Thu: ${money(result.income)} · Chi: ${money(result.expense)} · Còn lại: ${money(result.balance)} · Tỷ lệ giữ lại: ${result.savingsRate === null ? 'chưa có thu nhập' : result.savingsRate.toFixed(1)+'%'}`;
        const list=document.getElementById('money-entries'); list.replaceChildren();
        const entries=data.entries.filter(e=>e.date.slice(0,7)===monthInput.value).slice().reverse();
        if (!entries.length) list.textContent='Chưa có giao dịch trong tháng này.';
        entries.forEach(entry=>{const item=document.createElement('li');item.textContent=`${entry.date} · ${entry.type==='income'?'Thu':'Chi'} ${money(entry.amount)} · ${entry.category}\n${entry.notes}`;list.append(item);});
    }
};
