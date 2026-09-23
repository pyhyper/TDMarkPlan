const Icons = {
    paths: {
        edit: '<path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15zM12 20h8"/>',
        book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
        link: '<path d="m9 15 6-6M8 16l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 8a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-1 1"/>',
        lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
        unlock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2m-3.5 10v2"/>',
        spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
        list: '<path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/>',
        upload: '<path d="M12 16V3m0 0L7 8m5-5 5 5M4 16v5h16v-5"/>',
        download: '<path d="M12 3v13m0 0-5-5m5 5 5-5M4 18v3h16v-3"/>',
        chart: '<path d="M3 3v18h18M7 16v-5m5 5V6m5 10v-8"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
        study: '<path d="m2 8 10-5 10 5-10 5zM6 10v6c4 3 8 3 12 0v-6m4-2v8"/>',
        fitness: '<path d="M6 6v12M3 9v6m15-9v12m3-9v6M6 12h12"/>',
        code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/>',
        wallet: '<path d="M3 7h18v13H3V7Zm0 0V4h15v3m-3 5h6v4h-6z"/>',
        target: '<circle cx="12" cy="12" r="4"/>',
        note: '<path d="M4 3h11l5 5v13H4zM14 3v6h6M8 13h8m-8 4h5"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
        trash: '<path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6"/>',
        eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
        alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4m0 4h.01"/>',
        check: '<polyline points="20 6 9 17 4 12"/>',
        x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
    },
    svg(name) { return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${this.paths[name] || this.paths.note}</svg>`; },
    init() { document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = this.svg(el.dataset.icon); }); }
};
document.addEventListener('DOMContentLoaded', () => Icons.init());
