const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');

const classes = new Set();
const storage = {};
const events = {};
const elements = {};
const makeElem = (id = '') => {
    const attrs = {};
    const localClasses = new Set();
    const children = [];
    const listeners = {};
    const obj = {
        id,
        tagName: 'DIV',
        value: '',
        textContent: '',
        innerHTML: '',
        style: {},
        dataset: {},
        hidden: false,
        get className() { return Array.from(localClasses).join(' '); },
        set className(v) {
            localClasses.clear();
            (v || '').split(/\s+/).filter(Boolean).forEach(c => localClasses.add(c));
        },
        children,
        classList: {
            contains: c => localClasses.has(c) || classes.has(c),
            add: (...c) => c.forEach(x => { localClasses.add(x); classes.add(x); }),
            remove: (...c) => c.forEach(x => { localClasses.delete(x); classes.delete(x); })
        },
        addEventListener: (evt, fn) => {
            listeners[evt] ||= [];
            listeners[evt].push(fn);
        },
        click: () => {
            (listeners['click'] || []).forEach(fn => fn({ target: obj, stopPropagation: () => {} }));
        },
        close: () => {},
        showModal: () => {},
        closest: () => null,
        replaceChildren: (...c) => { children.length = 0; children.push(...c); },
        appendChild: c => { children.push(c); },
        append: (...c) => { children.push(...c); },
        setAttribute: (k, v) => { attrs[k] = String(v); },
        getAttribute: k => attrs[k] ?? null,
        querySelectorAll: selector => children.filter(c => selector.includes('card') ? (c.className && c.className.includes('card')) : true),
        querySelector: selector => {
            if (selector.includes('button')) {
                for (const c of children) {
                    if (c.tagName === 'BUTTON') return c;
                    if (c.children) {
                        const found = c.children.find(x => x.tagName === 'BUTTON');
                        if (found) return found;
                    }
                }
            }
            return children[0] || null;
        }
    };
    return obj;
};

const el = id => (elements[id] ||= makeElem(id));

const context = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    window: {
        addEventListener: (evt, handler) => {
            events[evt] ||= [];
            events[evt].push(handler);
        },
        dispatchEvent: evt => {
            (events[evt.type] || []).forEach(h => h(evt));
        }
    },
    CustomEvent: class { constructor(t, d) { this.type = t; this.detail = d?.detail; } },
    localStorage: {
        getItem: k => storage[k] || null,
        setItem: (k, v) => { storage[k] = v; }
    },
    document: {
        addEventListener: () => {},
        body: {
            classList: {
                contains: c => classes.has(c),
                add: (...c) => c.forEach(x => classes.add(x)),
                remove: (...c) => c.forEach(x => classes.delete(x)),
                toggle: (c, force) => {
                    if (force === undefined) {
                        if (classes.has(c)) { classes.delete(c); return false; }
                        classes.add(c); return true;
                    }
                    if (force) { classes.add(c); return true; }
                    classes.delete(c); return false;
                }
            }
        },
        documentElement: { style: { setProperty: () => {} } },
        getElementById: el,
        querySelectorAll: () => [],
        querySelector: () => null,
        createElement: tag => {
            const elem = makeElem();
            elem.tagName = tag.toUpperCase();
            return elem;
        }
    }
};

vm.createContext(context);
vm.runInContext(fs.readFileSync('assets/js/icons.js', 'utf8') + '\nthis.Icons = Icons;', context);
vm.runInContext(fs.readFileSync('assets/js/workspace.js', 'utf8') + '\nthis.Workspace = Workspace;', context);
vm.runInContext(fs.readFileSync('assets/js/app.js', 'utf8') + '\nthis.App = App;', context);
vm.runInContext(fs.readFileSync('assets/js/journal.js', 'utf8') + '\nthis.Journal = Journal;', context);

const Icons = context.Icons;
const Workspace = context.Workspace;
const App = context.App;
const Journal = context.Journal;

// Test 0: initTheme defaults to kobo
delete storage['ereader_theme'];
classes.clear();
App.initTheme();
assert(classes.has('theme-kobo'), 'initTheme defaults to theme-kobo');
assert.equal(context.localStorage.getItem('ereader_theme'), 'kobo');

// Test 1: setTheme valid options
App.setTheme('kobo');
assert(classes.has('theme-kobo'), 'theme-kobo applied');
assert.equal(context.localStorage.getItem('ereader_theme'), 'kobo');

App.setTheme('paper');
assert(classes.has('theme-paper') && !classes.has('theme-kobo'), 'theme-paper applied');
assert.equal(context.localStorage.getItem('ereader_theme'), 'paper');

App.setTheme('black');
assert(classes.has('theme-black') && !classes.has('theme-paper'), 'theme-black applied');
assert.equal(context.localStorage.getItem('ereader_theme'), 'black');

// Test 2: Legacy theme migrations
App.setTheme('candy-pink');
assert(classes.has('theme-kobo'), 'candy-pink migrated to kobo');
App.setTheme('dusk-blue');
assert(classes.has('theme-kobo'), 'dusk-blue migrated to kobo');

// Test 3: formatNotePreview
const testText = 'Missing something. <mark class="hl-blue">Blue highlight</mark> and ==Yellow== and **Bold** text.\nNext line.';
const formatted = Journal.formatNotePreview(testText);
assert(formatted.includes('<mark class="hl-blue">Blue highlight</mark>'), 'Preserves safe mark tag');
assert(formatted.includes('<mark class="hl-yellow">Yellow</mark>'), 'Formats == markdown highlight');
assert(formatted.includes('<strong>Bold</strong>'), 'Formats bold');
assert(formatted.includes('<br>Next line.'), 'Preserves newlines');

// Test 4: XSS prevention
const xss = '<script>alert(1)</script><mark class="hl-red">Red</mark><img src=x onerror=alert(2)>';
const safe = Journal.formatNotePreview(xss);
assert(!safe.includes('<script>'), 'Escapes script tags');
assert(!safe.includes('<img'), 'Escapes img tags');
assert(safe.includes('<mark class="hl-red">Red</mark>'), 'Keeps safe mark tag');

// Test 5: Trash and Eye Icons
const trashSvg = Icons.svg('trash');
assert(trashSvg.includes('<svg') && trashSvg.includes('M3 6h18'), 'Generates valid trash SVG icon');
const eyeSvg = Icons.svg('eye');
assert(eyeSvg.includes('<svg') && eyeSvg.includes('circle cx="12" cy="12" r="3"'), 'Generates valid eye SVG icon');
const eyeOffSvg = Icons.svg('eye-off');
assert(eyeOffSvg.includes('<svg'), 'Generates valid eye-off SVG icon');

// Test 6: Note Auto-Delete Serialization and Parsing
const sampleText = 'Review vocabulary for section 3';
const futureTs = Date.now() + 24 * 3600 * 1000;
const serialized = Journal.serializeNote(sampleText, futureTs);
assert(serialized.startsWith('<!-- auto-delete:'), 'Serializes with auto-delete header');
assert(serialized.includes(sampleText), 'Contains original text');

const parsed = Journal.parseNote(serialized);
assert.equal(parsed.text, sampleText, 'Parses text correctly without metadata tag');
assert(Math.abs(parsed.autoDeleteAt - futureTs) < 2000, 'Parses auto-delete timestamp accurately');

// Formatter strips auto-delete comment
const formattedPreview = Journal.formatNotePreview(serialized);
assert(!formattedPreview.includes('<!-- auto-delete'), 'Preview strips auto-delete metadata comment');
assert(formattedPreview.includes(sampleText), 'Preview displays clean note content');

// Format time remaining
const remainingStr = Journal.formatTimeRemaining(futureTs);
assert(remainingStr.includes('d') || remainingStr.includes('h'), 'Formats remaining time cleanly');
const expiredStr = Journal.formatTimeRemaining(Date.now() - 5000);
assert.equal(expiredStr, 'Đã hết hạn', 'Detects expired timestamp');

// Test 7: Note Visibility Toggle
App.toggleNotesVisibility(false);
assert(classes.has('hide-task-notes'), 'Hiding notes adds hide-task-notes class');
assert.equal(context.localStorage.getItem('ereader_notes_visible'), '0', 'Persists hidden state');

App.toggleNotesVisibility(true);
assert(!classes.has('hide-task-notes'), 'Showing notes removes hide-task-notes class');
assert.equal(context.localStorage.getItem('ereader_notes_visible'), '1', 'Persists visible state');

// Test 8: Single Plan Display & Header Plan Label
App.planData = { title: 'IELTS 6.5 Intensive', domain: 'ielts' };
Workspace.slot = 1;
Workspace.summaries = [
    { slot: 1, exists: true, title: 'IELTS 6.5 Intensive', domain: 'ielts' },
    { slot: 2, exists: false, title: 'Thêm plan thứ hai', domain: '' }
];
Workspace.render();

const deckEl = context.document.getElementById('workspace-deck');
assert.equal(deckEl.hidden, true, 'workspace-deck is hidden to ensure only 1 plan displays');

const labelEl = context.document.getElementById('header-plan-label');
assert(labelEl.textContent.includes('Plan 1'), 'Header displays active plan slot');

// Test 9: Render Plan Modal Cards and click handling
App.renderModalPlans();
const planListEl = context.document.getElementById('modal-plans-list');
assert(planListEl, 'modal-plans-list element exists');
const cards = planListEl.querySelectorAll('.modal-plan-card');
assert.equal(cards.length, 2, '2 plan cards rendered in modal');
assert.equal(cards[0].getAttribute('role'), 'button');
assert.equal(cards[0].getAttribute('tabindex'), '0');
assert.equal(cards[0].classList.contains('is-active'), true, 'Card 1 is active');
const btn1 = cards[0].querySelector('button.btn-sample');
assert.equal(btn1.textContent, '✓ Đang hiển thị');
const btn2 = cards[1].querySelector('button.btn-sample');
assert.equal(btn2.textContent, '+ Thiết lập plan này');

let selectedSlot = null;
const origSelect = Workspace.select;
Workspace.select = async (slot) => { selectedSlot = slot; };
cards[1].click();
assert.equal(selectedSlot, 2, 'Clicking card 2 triggers Workspace.select(2)');

// When slot 2 is active, clicking card 1 triggers Workspace.select(1)
Workspace.slot = 2;
App.renderModalPlans();
const reCards = planListEl.querySelectorAll('.modal-plan-card');
assert.equal(reCards[1].classList.contains('is-active'), true, 'Card 2 is active');
let selectedSlot1 = null;
Workspace.select = async (slot) => { selectedSlot1 = slot; };
reCards[0].click();
assert.equal(selectedSlot1, 1, 'Clicking card 1 triggers Workspace.select(1)');
Workspace.select = origSelect;

// Test 10: Journal.createEditableField and serializeEditor
const editableField = Journal.createEditableField('Placeholder...', '<mark class="hl-green">Tạo thư mục dự án</mark>\nNext line', 'Mô tả công việc');
assert.equal(editableField.getAttribute('role'), 'textbox');
assert(editableField.innerHTML.includes('<mark class="hl-green">Tạo thư mục dự án</mark>'), 'Initializes innerHTML with rendered highlight');

// Simulate DOM structure for serialization
const mockEditor = {
    childNodes: [
        {
            nodeType: 1,
            tagName: 'MARK',
            className: 'hl-green',
            childNodes: [{ nodeType: 3, nodeValue: 'Tạo thư mục dự án `ai-evals-web` trên máy Mac' }]
        },
        { nodeType: 3, nodeValue: ' và ghi chú bổ sung' }
    ]
};
const serializedEditor = Journal.serializeEditor(mockEditor);
assert(serializedEditor.includes('<mark class="hl-green">Tạo thư mục dự án `ai-evals-web` trên máy Mac</mark>'), 'Serializes mark with class hl-green');
assert(serializedEditor.includes('và ghi chú bổ sung'), 'Preserves plain text');

// Test 11: Icons alert, check, and x
assert(Icons.svg('alert').includes('<path'), 'Generates valid alert SVG');
assert(Icons.svg('check').includes('<polyline'), 'Generates valid check SVG');
assert(Icons.svg('x').includes('<line'), 'Generates valid x SVG');

// Test 12: External btn-new-slot is NOT in index.php
const indexHtml = fs.readFileSync('index.php', 'utf8');
assert(!indexHtml.includes('id="btn-new-slot"'), 'btn-new-slot removed from main page (only exists in eye modal)');
assert(indexHtml.includes('id="app-confirm-dialog"'), 'app-confirm-dialog exists in index.php');

// Test 13: Task Renaming & Confirm modal methods exist on App
assert(typeof App.startRenameTask === 'function', 'startRenameTask function exists on App');
assert(typeof App.submitRenameTask === 'function', 'submitRenameTask function exists on App');
assert(typeof App.confirm === 'function', 'confirm function exists on App');
assert(typeof App.deletePlan === 'function', 'deletePlan function exists on App');

console.log('PASS: Theme, Notebook Highlight, Delete Icon, Auto-Delete, Note Visibility, Plan Modal, Visual Highlight Editor, Confirm Dialog & Task Renaming tests completed successfully.');

