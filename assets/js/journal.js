const Journal = {
    drafts: {},
    queues: {},
    cards(item) { return (item.note_cards ?? (item.notes ? [item.notes] : [])).slice(); },

    parseNote(raw) {
        if (typeof raw !== 'string') return { text: '', autoDeleteAt: null };
        const match = raw.match(/^<!--\s*auto-delete:\s*([^\s>]+)\s*-->\r?\n?/);
        if (match) {
            const text = raw.substring(match[0].length);
            const ts = new Date(match[1]).getTime();
            return {
                text: text,
                autoDeleteAt: isNaN(ts) ? null : ts
            };
        }
        return { text: raw, autoDeleteAt: null };
    },

    serializeNote(text, autoDeleteAt) {
        const clean = (text || '').replace(/^<!--\s*auto-delete:[^>]+-->\r?\n?/, '');
        if (autoDeleteAt && !isNaN(autoDeleteAt)) {
            return `<!-- auto-delete: ${new Date(autoDeleteAt).toISOString()} -->\n${clean}`;
        }
        return clean;
    },

    formatTimeRemaining(ts) {
        if (!ts) return '';
        const diff = ts - Date.now();
        if (diff <= 0) return 'Đã hết hạn';
        const mins = Math.floor(diff / (60 * 1000));
        const hours = Math.floor(diff / (3600 * 1000));
        const days = Math.floor(diff / (24 * 3600 * 1000));
        if (days >= 1) {
            const remH = hours % 24;
            return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
        }
        if (hours >= 1) {
            const remM = mins % 60;
            return remM > 0 ? `${hours}h ${remM}m` : `${hours}h`;
        }
        return `${Math.max(1, mins)}m`;
    },

    formatNotePreview(text, options = {}) {
        const clean = (text || '').replace(/^<!--\s*auto-delete:[^>]+-->\r?\n?/, '');
        if (!clean || !clean.trim()) {
            return options.forEditor ? '' : '<span class="note-preview-empty">Chưa có nội dung ghi chú. Bấm để viết và đánh dấu highlight…</span>';
        }
        let escaped = clean
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Restore safe allowed mark tags
        escaped = escaped.replace(/&lt;mark(?:\s+class="([^"]*)")?&gt;(.*?)&lt;\/mark&gt;/gi, (m, cls, content) => {
            const safeClass = (cls || 'hl-yellow').replace(/[^a-z0-9_-]/gi, '');
            return `<mark class="${safeClass}">${content}</mark>`;
        });

        // Markdown highlight: ==text==
        escaped = escaped.replace(/==([^=\n]+)==/g, '<mark class="hl-yellow">$1</mark>');

        // Markdown bold & italic
        escaped = escaped.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        escaped = escaped.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

        // Newlines to <br>
        escaped = escaped.replace(/\n/g, '<br>');

        return escaped;
    },

    serializeEditor(editor) {
        if (!editor) return '';
        const walk = (node) => {
            if (node.nodeType === 3) { // Node.TEXT_NODE
                return node.nodeValue;
            }
            if (node.nodeType !== 1) { // Node.ELEMENT_NODE
                return '';
            }
            const tag = node.tagName.toLowerCase();
            if (tag === 'br') return '\n';
            let inner = '';
            for (const child of node.childNodes) {
                inner += walk(child);
            }
            if (tag === 'mark') {
                const cls = (node.className || 'hl-yellow').trim().replace(/[^a-z0-9_-]/gi, '');
                return `<mark class="${cls}">${inner}</mark>`;
            }
            if (tag === 'strong' || tag === 'b') return `<strong>${inner}</strong>`;
            if (tag === 'em' || tag === 'i') return `<em>${inner}</em>`;
            if (tag === 'div' || tag === 'p') return (inner ? inner + '\n' : '\n');
            return inner;
        };

        let result = '';
        for (const child of editor.childNodes) {
            result += walk(child);
        }
        return result.replace(/\r\n/g, '\n').replace(/\n+$/, '');
    },

    createEditableField(placeholder, initialValue, ariaLabel) {
        const editor = document.createElement('div');
        editor.className = 'task-note-textarea task-note-editable';
        editor.contentEditable = 'true';
        editor.setAttribute('role', 'textbox');
        if (placeholder) {
            editor.setAttribute('data-placeholder', placeholder);
            if (editor.dataset) editor.dataset.placeholder = placeholder;
        }
        if (ariaLabel) editor.setAttribute('aria-label', ariaLabel);

        Object.defineProperty(editor, 'value', {
            get: () => this.serializeEditor(editor),
            set: (val) => {
                editor.innerHTML = this.formatNotePreview(val || '', { forEditor: true });
            },
            configurable: true
        });

        editor.value = initialValue || '';

        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData)?.getData('text/plain') || '';
            if (text) {
                if (/<mark\b/i.test(text)) {
                    const html = this.formatNotePreview(text, { forEditor: true });
                    document.execCommand('insertHTML', false, html);
                } else {
                    document.execCommand('insertText', false, text);
                }
            }
        });

        return editor;
    },

    createToolbar(input, preview, onUpdate, options = {}) {
        const bar = document.createElement('div');
        bar.className = 'note-toolbar';

        const swatches = document.createElement('div');
        swatches.className = 'note-swatches';

        const renderSwatches = () => {
            swatches.replaceChildren();
            const isKobo = document.body.classList.contains('theme-kobo');
            const isBlack = document.body.classList.contains('theme-black');

            const applyMark = (cls) => {
                if (input.contentEditable === 'true') {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        if (input.contains(range.commonAncestorContainer) || input === range.commonAncestorContainer) {
                            if (!sel.isCollapsed) {
                                if (cls) {
                                    const frag = range.extractContents();
                                    frag.querySelectorAll('mark').forEach(m => {
                                        while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m);
                                        m.remove();
                                    });
                                    const mark = document.createElement('mark');
                                    mark.className = cls;
                                    mark.appendChild(frag);
                                    range.insertNode(mark);
                                    sel.removeAllRanges();
                                    const newRange = document.createRange();
                                    newRange.selectNodeContents(mark);
                                    sel.addRange(newRange);
                                } else {
                                    const parentMark = (sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement)?.closest('mark');
                                    if (parentMark && input.contains(parentMark)) {
                                        while (parentMark.firstChild) parentMark.parentNode.insertBefore(parentMark.firstChild, parentMark);
                                        parentMark.remove();
                                    }
                                    const frag = range.extractContents();
                                    frag.querySelectorAll('mark').forEach(m => {
                                        while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m);
                                        m.remove();
                                    });
                                    range.insertNode(frag);
                                }
                            } else if (cls) {
                                const mark = document.createElement('mark');
                                mark.className = cls;
                                mark.textContent = 'đoạn đánh dấu';
                                range.insertNode(mark);
                                sel.removeAllRanges();
                                const newRange = document.createRange();
                                newRange.selectNodeContents(mark);
                                sel.addRange(newRange);
                            }
                        } else {
                            input.focus();
                        }
                    } else {
                        input.focus();
                    }
                } else {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const val = input.value || '';
                    if (start !== end) {
                        const sel = val.substring(start, end);
                        const clean = sel.replace(/<\/?mark[^>]*>/gi, '');
                        const rep = cls ? `<mark class="${cls}">${clean}</mark>` : clean;
                        if (input.setRangeText) input.setRangeText(rep, start, end, 'select');
                    } else if (cls) {
                        const placeholder = 'đoạn đánh dấu';
                        const rep = `<mark class="${cls}">${placeholder}</mark>`;
                        if (input.setRangeText) {
                            input.setRangeText(rep, start, end, 'end');
                            input.selectionStart = start + `<mark class="${cls}">`.length;
                            input.selectionEnd = input.selectionStart + placeholder.length;
                        }
                    }
                    input.focus();
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                if (onUpdate) onUpdate();
            };

            if (isKobo) {
                const colors = [
                    { id: 'hl-yellow', label: 'Vàng', bg: '#f7e28b', title: 'Màu vàng (Butter Yellow)' },
                    { id: 'hl-blue',   label: 'Xanh lơ', bg: '#9fd3e9', title: 'Màu xanh dương (Dusk Blue)' },
                    { id: 'hl-pink',   label: 'Hồng', bg: '#f4adc3', title: 'Màu hồng (Candy Pink)' },
                    { id: 'hl-green',  label: 'Xanh lá', bg: '#a7dab9', title: 'Màu xanh lá (Misty Green)' },
                    { id: 'hl-red',    label: 'Đỏ', bg: '#ea8a78', title: 'Màu đỏ (Cayenne Red)' },
                    { id: 'hl-black',  label: 'Bút đen', bg: '#201d1b', title: 'Màu đen (Black Pen)' }
                ];
                colors.forEach(c => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn-swatch';
                    btn.title = c.title;
                    btn.innerHTML = `<span class="btn-swatch-dot" style="background:${c.bg}; border: 1px solid rgba(0,0,0,0.15);"></span><span>${c.label}</span>`;
                    btn.addEventListener('mousedown', e => e.preventDefault());
                    btn.addEventListener('pointerdown', e => e.preventDefault());
                    btn.addEventListener('click', e => { e.preventDefault(); applyMark(c.id); });
                    swatches.appendChild(btn);
                });
            } else if (isBlack) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-swatch';
                btn.title = 'Highlight (Nền trắng chữ đen)';
                btn.innerHTML = `<span class="btn-swatch-dot" style="background:#eae5dc; border:1px solid #333;"></span><span>Đánh dấu</span>`;
                btn.addEventListener('mousedown', e => e.preventDefault());
                btn.addEventListener('pointerdown', e => e.preventDefault());
                btn.addEventListener('click', e => { e.preventDefault(); applyMark('hl-mono'); });
                swatches.appendChild(btn);
            } else {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-swatch';
                btn.title = 'Highlight (Nền đen chữ trắng)';
                btn.innerHTML = `<span class="btn-swatch-dot" style="background:#23201d; border:1px solid #e3dac9;"></span><span>Đánh dấu</span>`;
                btn.addEventListener('mousedown', e => e.preventDefault());
                btn.addEventListener('pointerdown', e => e.preventDefault());
                btn.addEventListener('click', e => { e.preventDefault(); applyMark('hl-mono'); });
                swatches.appendChild(btn);
            }

            const btnClear = document.createElement('button');
            btnClear.type = 'button';
            btnClear.className = 'btn-swatch';
            btnClear.title = 'Bỏ màu đánh dấu vùng chọn';
            btnClear.textContent = '✕ Bỏ màu';
            btnClear.addEventListener('mousedown', e => e.preventDefault());
            btnClear.addEventListener('pointerdown', e => e.preventDefault());
            btnClear.addEventListener('click', e => { e.preventDefault(); applyMark(null); });
            swatches.appendChild(btnClear);
        };

        renderSwatches();
        window.addEventListener('themechanged', renderSwatches);
        bar.appendChild(swatches);

        // Auto-delete timer control
        if (options.onSetExpiry) {
            const autoDelWrap = document.createElement('div');
            autoDelWrap.className = 'note-auto-delete-wrap';
            const sel = document.createElement('select');
            sel.className = 'note-auto-delete-select';
            sel.title = 'Tự động xóa ghi chú này sau một khoảng thời gian';

            const opts = [
                { id: 'never', label: '⏱ Tự xóa: Không' },
                { id: '1h',    label: '⏱ Sau 1 giờ' },
                { id: '24h',   label: '⏱ Sau 24 giờ' },
                { id: '3d',    label: '⏱ Sau 3 ngày' },
                { id: '7d',    label: '⏱ Sau 7 ngày' },
                { id: '30d',   label: '⏱ Sau 30 ngày' }
            ];

            opts.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.id;
                opt.textContent = o.label;
                sel.appendChild(opt);
            });

            if (options.currentExpiry) {
                const diffHours = (options.currentExpiry - Date.now()) / (3600 * 1000);
                if (diffHours <= 1.1 && diffHours > 0) sel.value = '1h';
                else if (diffHours <= 25 && diffHours > 1.1) sel.value = '24h';
                else if (diffHours <= 75 && diffHours > 25) sel.value = '3d';
                else if (diffHours <= 175 && diffHours > 75) sel.value = '7d';
                else if (diffHours > 175) sel.value = '30d';
                else sel.value = 'never';
            } else {
                sel.value = 'never';
            }

            sel.addEventListener('change', e => {
                const val = e.target.value;
                let expiry = null;
                if (val === '1h') expiry = Date.now() + 1 * 3600 * 1000;
                else if (val === '24h') expiry = Date.now() + 24 * 3600 * 1000;
                else if (val === '3d') expiry = Date.now() + 3 * 24 * 3600 * 1000;
                else if (val === '7d') expiry = Date.now() + 7 * 24 * 3600 * 1000;
                else if (val === '30d') expiry = Date.now() + 30 * 24 * 3600 * 1000;
                options.onSetExpiry(expiry);
            });
            autoDelWrap.appendChild(sel);
            bar.appendChild(autoDelWrap);
        }

        // Delete note button in toolbar
        if (options.onDelete) {
            const btnDel = document.createElement('button');
            btnDel.type = 'button';
            btnDel.className = 'btn-delete-note';
            btnDel.title = 'Xóa ghi chú này';
            btnDel.innerHTML = (typeof Icons !== 'undefined' && Icons.svg) ? `${Icons.svg('trash')}<span>Xóa</span>` : '🗑 Xóa';
            btnDel.addEventListener('click', e => {
                e.preventDefault();
                options.onDelete();
            });
            bar.appendChild(btnDel);
        }

        return bar;
    },

    // Native details/summary provides keyboard-accessible expand/collapse.
    renderCards(host, initial, onChange, onSave, title) {
        let cards = initial.slice();
        const list = document.createElement('div');
        const add = document.createElement('button');
        add.type = 'button'; add.className = 'btn-sample';
        const status = document.createElement('span'); status.className = 'journal-status'; status.setAttribute('role', 'status');
        const save = document.createElement('button'); save.type = 'button'; save.className = 'btn-sample'; save.textContent = 'Lưu ghi chú';
        const changed = () => { onChange(cards.slice()); status.textContent = 'Chưa lưu'; };

        // Auto-prune expired cards
        const now = Date.now();
        const validCards = cards.filter(note => {
            const p = this.parseNote(note);
            return !p.autoDeleteAt || p.autoDeleteAt > now;
        });
        if (validCards.length < cards.length) {
            cards = validCards;
            changed();
            if (onSave) onSave();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Đã tự động xóa ghi chú đã hết hạn');
            }
        }

        const deleteNote = async (i) => {
            const parsedText = this.parseNote(cards[i] || '').text.trim();
            if (parsedText) {
                if (typeof App !== 'undefined' && App.confirm) {
                    const ok = await App.confirm({
                        title: `Xóa ghi chú ${i + 1}`,
                        message: 'Bạn có chắc chắn muốn xóa ghi chú này không?',
                        okText: 'Xóa ghi chú',
                        danger: true
                    });
                    if (!ok) return;
                } else if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
                    return;
                }
            }
            cards.splice(i, 1);
            changed();
            draw(Math.max(0, i - 1));
            if (onSave) onSave();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Đã xóa ghi chú');
            }
        };

        const draw = (openIndex = -1) => {
            list.replaceChildren();
            cards.forEach((note, index) => {
                const parsed = this.parseNote(note);
                let currentExpiry = parsed.autoDeleteAt;

                const details = document.createElement('details'); details.className = 'note-card'; details.open = index === openIndex;
                const summary = document.createElement('summary'); summary.className = 'note-summary';

                const summaryLeft = document.createElement('div');
                summaryLeft.className = 'note-summary-left';
                summaryLeft.innerHTML = `<span>Ghi chú ${index + 1}</span>`;

                if (currentExpiry) {
                    const isNear = (currentExpiry - Date.now()) <= 3600 * 1000;
                    const badge = document.createElement('span');
                    badge.className = `note-badge-expiry${isNear ? ' near-expiry' : ''}`;
                    badge.title = 'Thời gian tự động xóa ghi chú';
                    badge.textContent = `⏱ ${this.formatTimeRemaining(currentExpiry)}`;
                    summaryLeft.appendChild(badge);
                }

                const summaryActions = document.createElement('div');
                summaryActions.className = 'note-summary-actions';
                const btnSumDel = document.createElement('button');
                btnSumDel.type = 'button';
                btnSumDel.className = 'btn-delete-note';
                btnSumDel.title = `Xóa ghi chú ${index + 1}`;
                btnSumDel.setAttribute('aria-label', `Xóa ghi chú ${index + 1}`);
                btnSumDel.innerHTML = (typeof Icons !== 'undefined' && Icons.svg) ? `${Icons.svg('trash')}<span>Xóa</span>` : '🗑 Xóa';
                btnSumDel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteNote(index);
                });
                summaryActions.appendChild(btnSumDel);

                summary.append(summaryLeft, summaryActions);

                const input = this.createEditableField('Kết quả, điều học được, khó khăn… (Tô đen rồi bấm màu để đánh dấu)', parsed.text, `${title} — ghi chú ${index + 1}`);

                const preview = document.createElement('div');
                preview.className = 'note-preview';
                preview.hidden = true;

                const toolbar = this.createToolbar(input, preview, () => changed(), {
                    currentExpiry: currentExpiry,
                    onSetExpiry: (newExp) => {
                        currentExpiry = newExp;
                        cards[index] = this.serializeNote(input.value, currentExpiry);
                        changed();
                        draw(index);
                    },
                    onDelete: () => deleteNote(index)
                });

                input.addEventListener('input', () => {
                    cards[index] = this.serializeNote(input.value, currentExpiry);
                    changed();
                });

                details.append(summary, toolbar, input);
                list.appendChild(details);
            });
            add.disabled = cards.length >= 2; add.textContent = cards.length >= 2 ? 'Đã đủ 2 ghi chú' : '+ Thêm ghi chú';
            save.hidden = cards.length === 0;
        };
        add.addEventListener('click', () => { if (cards.length >= 2) return; cards.push(''); changed(); draw(cards.length - 1); });
        save.addEventListener('click', async () => {
            save.disabled = true; status.textContent = 'Đang lưu…';
            const snapshot = JSON.stringify(cards);
            try { await onSave(); status.textContent = JSON.stringify(cards) === snapshot ? 'Đã lưu' : 'Còn thay đổi chưa lưu'; }
            catch (error) { status.textContent = 'Chưa lưu được. Hãy thử lại.'; App.showToast(error.message); }
            finally { save.disabled = false; }
        });
        host.append(list, add, save, status); draw();
    },

    renderTask(task, host) {
        const state = this.drafts[task.id] || {description: task.description || '', note_cards: this.cards(task)};
        const edit = (key, value) => {
            const latest = this.drafts[task.id] || {description: task.description || '', note_cards: this.cards(task)};
            this.drafts[task.id] = {...latest, [key]:value};
        };
        const section = document.createElement('section'); section.className = 'task-journal';
        const details = document.createElement('details'); details.className = 'description-card'; details.open = !!state.description;
        const summary = document.createElement('summary'); summary.textContent = 'Mô tả công việc';
        const text = this.createEditableField('Mục tiêu, hướng dẫn, tiêu chí hoàn thành…', state.description, `Mô tả: ${task.title}`);

        const preview = document.createElement('div');
        preview.className = 'note-preview';
        preview.hidden = true;
        preview.innerHTML = this.formatNotePreview(state.description);

        const toolbar = this.createToolbar(text, preview, () => edit('description', text.value));
        const status = document.createElement('span'); status.className = 'journal-status'; status.setAttribute('role', 'status');
        text.addEventListener('input', () => {
            edit('description', text.value);
            preview.innerHTML = this.formatNotePreview(text.value);
            status.textContent = 'Chưa lưu';
        });
        const save = document.createElement('button'); save.type = 'button'; save.className = 'btn-sample'; save.textContent = 'Lưu mô tả';
        save.addEventListener('click', async () => {
            save.disabled = true;
            try { await this.save(task.id); status.textContent = this.drafts[task.id] ? 'Còn thay đổi chưa lưu' : 'Đã lưu'; }
            catch (e) { status.textContent = 'Chưa lưu được'; App.showToast(e.message); }
            finally { save.disabled = false; }
        });
        details.append(summary, toolbar, text, preview, save, status); section.appendChild(details);
        this.renderCards(section, state.note_cards, cards => edit('note_cards', cards), () => this.save(task.id), task.title);
        host.appendChild(section);
    },

    save(taskId) {
        const task = App.findTask(taskId);
        if (!this.drafts[taskId]) return this.queues[taskId] || Promise.resolve();
        const snapshot = JSON.parse(JSON.stringify(this.drafts[taskId]));
        const planId = App.currentPlanId;
        const request = (this.queues[taskId] || Promise.resolve()).catch(() => {}).then(async () => {
            const response = await App.apiFetch('api.php?action=update_task', {method:'POST', headers:{'Content-Type':'application/json','X-Plan-Token':App.getAuthToken(planId)}, body:JSON.stringify({p:planId,task_id:taskId,...snapshot})});
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Không lưu được ghi chú');
            Object.assign(task, snapshot, {notes:snapshot.note_cards[0] || ''});
            if (JSON.stringify(this.drafts[taskId]) === JSON.stringify(snapshot)) delete this.drafts[taskId];
        });
        this.queues[taskId] = request; return request;
    },
    async flush() {
        await Promise.all(Object.keys(this.drafts).map(id => this.save(id)));
        await Promise.all(Object.values(this.queues));
    }
};
