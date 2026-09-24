/**
 * Internationalization (i18n) Module for TDMarkPlan
 * Supports English (EN) and Vietnamese (VN)
 * Auto-detects user language via browser locale and geolocation/timezone hints
 */
const I18n = {
    currentLang: 'vi',

    translations: {
        vi: {
            // General & Common
            "app.title": "TDMarkPlan — Markdown TodoList & Plan Executor",
            "common.loading": "Đang tải…",
            "common.save": "Lưu",
            "common.cancel": "Hủy",
            "common.confirm": "Xác nhận",
            "common.close": "Đóng",
            "common.delete": "Xóa",
            "common.edit": "Sửa",
            "common.copy": "Sao chép",
            "common.copied": "Đã sao chép ✓",
            "common.custom": "Tùy chỉnh ↗",
            "common.mins": "phút",
            "common.days": "ngày",
            "common.weeks": "tuần",
            "common.week": "Tuần",
            "common.plan": "Kế hoạch",
            "common.active": "Đang hiển thị",
            "common.expand_collapse": "Mở / thu gọn",

            // Header (Bezel Bar)
            "header.edit_title_tooltip": "Bấm để đổi tiêu đề kế hoạch",
            "header.edit_title_btn": "Đổi tiêu đề kế hoạch",
            "header.copy_link_tooltip": "Copy link hiện tại",
            "header.copy_label": "[Copy]",
            "header.generating_link": "Đang tạo link…",
            "header.edit_link_btn": "Sửa link",
            "header.smaller_font": "Thu nhỏ cỡ chữ",
            "header.larger_font": "Phóng to cỡ chữ",
            "header.six_colors": "6 màu cơ bản: Vàng, Xanh dương, Hồng, Xanh lá, Đỏ, Đen",
            "header.theme_kobo": "Chế độ Kobo (Mặc định)",
            "header.theme_white": "Chế độ Giấy Trắng",
            "header.theme_sepia": "Chế độ Sepia Cổ Điển",
            "header.theme_black": "Chế độ Ban Đêm (Đen)",
            "header.btn_plans": "Kế hoạch",
            "header.pin_protect": "Bảo vệ bằng PIN",
            "header.auto_delete": "Tự xóa sau 90 ngày",
            "header.never_delete": "Không bao giờ xóa",

            // Navigation Tabs
            "nav.today": "Hôm nay",
            "nav.finance_today": "Thu chi & FIRE",
            "nav.notebook_today": "Ghi chú",
            "nav.toc": "Tổng quan",
            "nav.tasks": "Nhiệm vụ",
            "nav.journal": "Nhật ký",
            "nav.wizard": "Tạo Plan",
            "nav.export": "Xuất PLAN.md + nhật ký",
            "nav.export_notes": "Xuất ghi chú Markdown",
            "nav.export_finance": "Xuất dữ liệu tài chính",

            // Wizard Step 1: Domains
            "wizard.step1_title": "1. Chọn Lĩnh Vực Của Bạn (Kèm Hệ Thống Nhắc AI Chuyên Sâu):",
            "wizard.domain_ielts_title": "IELTS & Ngoại ngữ",
            "wizard.domain_ielts_desc": "Luyện thi 4 kỹ năng chuẩn Academic / General",
            "wizard.domain_fitness_title": "Gym & Thể hình",
            "wizard.domain_fitness_desc": "Lịch tập Push-Pull-Legs, Tăng cơ, Giảm mỡ",
            "wizard.domain_vibecode_title": "Vibe Code & AI",
            "wizard.domain_vibecode_desc": "Xây dựng ứng dụng full-stack, Cursor AI, MVP",
            "wizard.domain_finance_title": "Tài chính & FIRE",
            "wizard.domain_finance_desc": "Thu chi, ngân sách, quỹ dự phòng & độc lập tài chính",

            // Wizard Step 2: Setup
            "wizard.step2_title": "2. Thiết Lập Thời Gian & Mục Tiêu Cá Nhân:",
            "wizard.plan_title_label": "Tiêu đề kế hoạch:",
            "wizard.plan_title_placeholder": "Nhập tiêu đề kế hoạch của bạn…",
            "wizard.start_date_label": "Ngày bắt đầu:",
            "wizard.duration_label": "Khoảng thời gian:",
            "wizard.duration_1": "1 Tuần — đợt làm việc ngắn",
            "wizard.duration_2": "2 Tuần",
            "wizard.duration_4": "4 Tuần (1 Tháng)",
            "wizard.duration_6": "6 Tuần",
            "wizard.duration_8": "8 Tuần (2 Tháng)",
            "wizard.duration_12": "12 Tuần (3 Tháng)",
            "wizard.duration_16": "16 Tuần (4 Tháng)",
            "wizard.daily_time_label": "Thời gian mỗi ngày:",
            "wizard.minutes_30": "30 phút / ngày",
            "wizard.minutes_45": "45 phút / ngày",
            "wizard.minutes_60": "60 phút / ngày",
            "wizard.minutes_90": "90 phút / ngày",
            "wizard.minutes_120": "120 phút / ngày",
            "wizard.days_label": "Các ngày học trong tuần:",
            "wizard.days_mon_fri": "Thứ 2 → Thứ 6 (Nghỉ cuối tuần)",
            "wizard.days_mon_sat": "Thứ 2 → Thứ 7",
            "wizard.days_mon_wed_fri_sun": "Thứ 2, 4, 6 & Chủ Nhật",
            "wizard.days_all_week": "Cả tuần (7 ngày)",
            "wizard.level_label": "Trình độ hiện tại & Thiết lập kỹ năng:",
            "wizard.btn_ielts_skill": "Chọn trình độ & kỹ năng IELTS",
            "wizard.btn_fitness_skill": "Chọn lịch tập & ăn uống",
            "wizard.btn_code_skill": "Chọn nền tảng & dự án Vibe Code",
            "wizard.btn_finance_skill": "Thiết lập FIRE & Thu chi",
            "wizard.target_goal_label": "Mục tiêu cụ thể:",
            "wizard.password_label": "Mã PIN bảo vệ (Tùy chọn):",
            "wizard.password_placeholder": "Để trống nếu không đặt PIN",
            "wizard.btn_generate_prompt": "Tạo Lệnh Nhắc AI (Prompt)",
            "wizard.btn_instant_sample": "Nạp Kế Hoạch Mẫu (Nhanh)",
            "wizard.step3_title": "3. Nhận Kế Hoạch Chuẩn Từ AI:",
            "wizard.paste_label": "Dán toàn bộ kết quả AI trả về vào đây:",
            "wizard.paste_placeholder": "Dán markdown bắt đầu bằng --- hoặc # Week 1...",
            "wizard.btn_save_plan": "Lưu & Bắt Đầu Kế Hoạch",

            // Prompt Result Card
            "wizard.prompt_result_heading": "Lệnh Nhắc (Prompt) Đã Được Tối Ưu Cho AI:",
            "wizard.prompt_result_desc": "Hãy sao chép nội dung bên dưới và gửi cho ChatGPT, Claude hoặc Gemini. AI sẽ tạo ra bản kế hoạch chuẩn.",
            "wizard.btn_copy_prompt": "Sao Chép Lệnh Nhắc (Copy Prompt)",

            // Blank Notebook creation
            "wizard.blank_notebook_title": "Hoặc tạo Sổ ghi chú độc lập:",
            "wizard.blank_plan_title_label": "Tên sổ ghi chú",
            "wizard.blank_plan_title_placeholder": "Ý tưởng, nhật ký, ghi chép dự án…",
            "wizard.blank_plan_auto_delete_label": "Tự động xóa sau:",
            "wizard.btn_create_notebook": "Tạo sổ ghi chú",

            // Modals: Plan Title Modal
            "modal.title.heading": "Đổi tiêu đề kế hoạch",
            "modal.title.desc": "Nhập tiêu đề mới cho kế hoạch của bạn (tối đa 200 ký tự).",
            "modal.title.label": "Tiêu đề kế hoạch",
            "modal.title.placeholder": "Ví dụ: Luyện thi IELTS 6.5 Cấp Tốc",
            "modal.title.btn_save": "Lưu tiêu đề",

            // Modals: Link Edit Modal
            "modal.link.heading": "Sửa link của bạn",
            "modal.link.desc": "Đổi tên link dùng chung cho cả hai plan. Link cũ vẫn dẫn tới link mới.",
            "modal.link.label": "Tên link",
            "modal.link.help": "Dùng chữ thường không dấu, số, dấu gạch ngang hoặc gạch dưới.",
            "modal.link.btn_save": "Lưu link",

            // Modals: Password & Auto Delete Modal
            "modal.pw.heading": "Bảo Vệ Bằng Mã PIN & Tự Động Xóa",
            "modal.pw.desc": "Mã PIN này được dùng chung để bảo vệ cả hai kế hoạch trong link này.",
            "modal.pw.current_label": "Mật khẩu hiện tại",
            "modal.pw.current_placeholder": "Nhập mật khẩu hiện tại để xác nhận",
            "modal.pw.new_label": "Mật khẩu mới (4-32 ký tự)",
            "modal.pw.new_placeholder": "Nhập mật khẩu mới (để trống nếu muốn bỏ)",
            "modal.pw.new_help": "Để trống nếu chỉ muốn đổi thời gian tự xóa hoặc muốn gỡ mật khẩu.",
            "modal.pw.autodel_label": "Thời gian tự động xóa kế hoạch",
            "modal.pw.autodel_help": "Tính từ lần cuối được lưu. Hết thời gian, kế hoạch và ghi chú sẽ tự động được xóa vĩnh viễn.",
            "modal.pw.opt_90": "90 ngày (Mặc định)",
            "modal.pw.opt_30": "30 ngày (1 tháng)",
            "modal.pw.opt_180": "180 ngày (6 tháng)",
            "modal.pw.opt_365": "365 ngày (1 năm)",
            "modal.pw.opt_never": "Không bao giờ (Lưu vĩnh viễn)",
            "modal.pw.btn_save": "Lưu Cài Đặt",

            // Modals: Plan Switch Modal
            "modal.plan.heading": "Quản Lý & Chuyển Kế Hoạch",
            "modal.plan.desc": "Mỗi link hỗ trợ 2 ô kế hoạch hoạt động độc lập.",
            "modal.plan.current_badge": "✓ Đang hiển thị",
            "modal.plan.available_badge": "Có sẵn",
            "modal.plan.not_created_badge": "Chưa tạo",
            "modal.plan.view_btn": "Xem kế hoạch này →",
            "modal.plan.setup_btn": "+ Thiết lập plan này",
            "modal.plan.rename_btn": "Đổi tiêu đề (Slot {slot})",
            "modal.plan.delete_btn": "Xóa kế hoạch (Slot {slot})",
            "modal.plan.default_plan": "Kế hoạch học tập",
            "modal.plan.empty_slot": "Ô plan còn trống",

            // Daily & Tasks View
            "view.daily.chapter_sub": "Đang nạp lịch trình...",
            "view.daily.chapter_title": "Lịch Trình Hôm Nay",
            "view.daily.no_tasks": "Không có bài học trong ngày này. Hãy chọn ngày khác hoặc nghỉ ngơi phục hồi năng lượng nhé!",
            "view.daily.prev_day": "‹ Ngày trước",
            "view.daily.next_day": "Ngày sau ›",
            "view.daily.today": "Hôm nay",
            "view.daily.start_timer": "Bắt đầu đếm giờ",
            "view.daily.rename_task": "Đổi tên nhiệm vụ",
            "view.daily.notes_subtasks": "Ghi chú & Việc nhỏ",
            "view.daily.add_subtask_ph": "Thêm việc nhỏ…",
            "view.daily.add_subtask_btn": "Thêm",
            "view.daily.note_ph": "Ghi chú thực hiện nhiệm vụ…",
            "view.daily.completed": "Đã hoàn thành",
            "view.daily.in_progress": "Đang thực hiện",
            "view.daily.pending": "Chưa hoàn thành",
            "view.daily.actual_time": "Thời gian thực tế:",
            "view.daily.today_badge": "Hôm nay",
            "view.daily.rest_day_title": "Ngày Nghỉ / Không Có Lịch",

            // Table of Contents
            "nav.toc_sub": "Lộ Trình Toàn Diện",
            "nav.toc_title": "Mục Lục Kế Hoạch",

            // Import View
            "nav.import_sub": "Công Cụ Nhập PLAN.md",
            "nav.import_title": "Nhập Kế Hoạch Từ AI",

            // Review View
            "nav.review_sub": "Đánh Giá & Tinh Chỉnh",
            "nav.review_title": "Thích Ứng Kế Hoạch Thông Minh",

            // Guide View
            "nav.guide_sub": "Hướng Dẫn Nhanh",
            "nav.guide_title": "Cách Tạo PLAN.md Chuẩn Với AI",

            // Lock Screen
            "lock.heading": "Kế Hoạch Được Khóa",
            "lock.subtitle": "Kế hoạch này được bảo vệ bằng mã PIN.",
            "lock.prompt": "Nhập mã PIN để mở khóa kế hoạch này:",
            "lock.placeholder": "Mã PIN bảo vệ",
            "lock.btn_unlock": "Mở Khóa",
            "lock.wrong_pin": "Sai mã PIN. Vui lòng thử lại.",

            // Toast messages
            "toast.lang_switched": "Đã chuyển ngôn ngữ sang Tiếng Việt"
        },

        en: {
            // General & Common
            "app.title": "TDMarkPlan — Markdown TodoList & Plan Executor",
            "common.loading": "Loading…",
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.confirm": "Confirm",
            "common.close": "Close",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.copy": "Copy",
            "common.copied": "Copied ✓",
            "common.custom": "Customize ↗",
            "common.mins": "mins",
            "common.days": "days",
            "common.weeks": "weeks",
            "common.week": "Week",
            "common.plan": "Plan",
            "common.active": "Active",
            "common.expand_collapse": "Expand / Collapse",

            // Header (Bezel Bar)
            "header.edit_title_tooltip": "Click to edit plan title",
            "header.edit_title_btn": "Edit plan title",
            "header.copy_link_tooltip": "Copy current link",
            "header.copy_label": "[Copy]",
            "header.generating_link": "Generating link…",
            "header.edit_link_btn": "Edit link",
            "header.smaller_font": "Smaller font size",
            "header.larger_font": "Larger font size",
            "header.six_colors": "6 Basic Colors: Yellow, Blue, Pink, Green, Red, Black",
            "header.theme_kobo": "Kobo Theme (Default)",
            "header.theme_white": "Clean White Paper",
            "header.theme_sepia": "Classic Sepia Mode",
            "header.theme_black": "Night Mode (Black)",
            "header.btn_plans": "Plans",
            "header.pin_protect": "PIN Protected",
            "header.auto_delete": "Auto-delete in 90 days",
            "header.never_delete": "Never delete",

            // Navigation Tabs
            "nav.today": "Today",
            "nav.finance_today": "Finance & FIRE",
            "nav.notebook_today": "Notes",
            "nav.toc": "Overview",
            "nav.tasks": "Tasks",
            "nav.journal": "Journal",
            "nav.wizard": "New Plan",
            "nav.export": "Export PLAN.md + Journal",
            "nav.export_notes": "Export Markdown Notes",
            "nav.export_finance": "Export Finance Data",

            // Wizard Step 1: Domains
            "wizard.step1_title": "1. Choose Your Domain (With Deep AI Prompts):",
            "wizard.domain_ielts_title": "IELTS & Languages",
            "wizard.domain_ielts_desc": "Comprehensive 4-skills prep for Academic / General",
            "wizard.domain_fitness_title": "Gym & Fitness",
            "wizard.domain_fitness_desc": "Push-Pull-Legs, Hypertrophy, and Fat Loss schedule",
            "wizard.domain_vibecode_title": "Vibe Code & AI",
            "wizard.domain_vibecode_desc": "Build full-stack apps, Cursor AI workflows, MVP",
            "wizard.domain_finance_title": "Personal Finance & FIRE",
            "wizard.domain_finance_desc": "Cashflow, budgeting, emergency reserve & financial freedom",

            // Wizard Step 2: Setup
            "wizard.step2_title": "2. Time & Personal Goals Setup:",
            "wizard.plan_title_label": "Plan Title:",
            "wizard.plan_title_placeholder": "Enter your customized plan title…",
            "wizard.start_date_label": "Start Date:",
            "wizard.duration_label": "Duration:",
            "wizard.duration_1": "1 Week — short sprint",
            "wizard.duration_2": "2 Weeks",
            "wizard.duration_4": "4 Weeks (1 Month)",
            "wizard.duration_6": "6 Weeks",
            "wizard.duration_8": "8 Weeks (2 Months)",
            "wizard.duration_12": "12 Weeks (3 Months)",
            "wizard.duration_16": "16 Weeks (4 Months)",
            "wizard.daily_time_label": "Daily Time Commitment:",
            "wizard.minutes_30": "30 mins / day",
            "wizard.minutes_45": "45 mins / day",
            "wizard.minutes_60": "60 mins / day",
            "wizard.minutes_90": "90 mins / day",
            "wizard.minutes_120": "120 mins / day",
            "wizard.days_label": "Active Days in Week:",
            "wizard.days_mon_fri": "Mon → Fri (Weekends off)",
            "wizard.days_mon_sat": "Mon → Sat",
            "wizard.days_mon_wed_fri_sun": "Mon, Wed, Fri & Sun",
            "wizard.days_all_week": "All week (7 days)",
            "wizard.level_label": "Current Level & Skill Setup:",
            "wizard.btn_ielts_skill": "Configure IELTS Level & Skills",
            "wizard.btn_fitness_skill": "Configure Workout & Diet",
            "wizard.btn_code_skill": "Configure Platform & Project",
            "wizard.btn_finance_skill": "Configure FIRE & Cashflow",
            "wizard.target_goal_label": "Specific Goal:",
            "wizard.password_label": "Security PIN (Optional):",
            "wizard.password_placeholder": "Leave empty for no PIN",
            "wizard.btn_generate_prompt": "Generate AI Prompt",
            "wizard.btn_instant_sample": "Load Sample Plan (Quick)",
            "wizard.step3_title": "3. Get Standard Plan From AI:",
            "wizard.paste_label": "Paste the complete AI response here:",
            "wizard.paste_placeholder": "Paste markdown starting with --- or # Week 1...",
            "wizard.btn_save_plan": "Save & Start Plan",

            // Prompt Result Card
            "wizard.prompt_result_heading": "Optimized AI Prompt:",
            "wizard.prompt_result_desc": "Copy the content below and paste it into ChatGPT, Claude, or Gemini. The AI will generate a standard plan.",
            "wizard.btn_copy_prompt": "Copy Prompt",

            // Blank Notebook creation
            "wizard.blank_notebook_title": "Or create a Freeform Notebook:",
            "wizard.blank_plan_title_label": "Notebook Title",
            "wizard.blank_plan_title_placeholder": "Ideas, journal, project scratchpad…",
            "wizard.blank_plan_auto_delete_label": "Auto-delete after:",
            "wizard.btn_create_notebook": "Create Notebook",

            // Modals: Plan Title Modal
            "modal.title.heading": "Edit Plan Title",
            "modal.title.desc": "Enter a new title for your plan (up to 200 characters).",
            "modal.title.label": "Plan Title",
            "modal.title.placeholder": "e.g., Intensive IELTS 6.5 Preparation",
            "modal.title.btn_save": "Save Title",

            // Modals: Link Edit Modal
            "modal.link.heading": "Edit Your Link",
            "modal.link.desc": "Change the shared link for both plans. Old link still redirects to new link.",
            "modal.link.label": "Link Name",
            "modal.link.help": "Use lowercase letters, numbers, hyphens, or underscores.",
            "modal.link.btn_save": "Save Link",

            // Modals: Password & Auto Delete Modal
            "modal.pw.heading": "PIN Protection & Auto-Delete",
            "modal.pw.desc": "This PIN is shared across both plan slots under this link.",
            "modal.pw.current_label": "Current PIN",
            "modal.pw.current_placeholder": "Enter current PIN to confirm",
            "modal.pw.new_label": "New PIN (4-32 characters)",
            "modal.pw.new_placeholder": "Enter new PIN (leave blank to remove)",
            "modal.pw.new_help": "Leave blank if you only want to change auto-delete or remove PIN.",
            "modal.pw.autodel_label": "Plan Auto-Delete Period",
            "modal.pw.autodel_help": "Counted from last saved update. Once expired, plan and notes will be permanently removed.",
            "modal.pw.opt_90": "90 days (Default)",
            "modal.pw.opt_30": "30 days (1 month)",
            "modal.pw.opt_180": "180 days (6 months)",
            "modal.pw.opt_365": "365 days (1 year)",
            "modal.pw.opt_never": "Never (Keep forever)",
            "modal.pw.btn_save": "Save Settings",

            // Modals: Plan Switch Modal
            "modal.plan.heading": "Manage & Switch Plans",
            "modal.plan.desc": "Each link supports 2 independent plan slots.",
            "modal.plan.current_badge": "✓ Active",
            "modal.plan.available_badge": "Available",
            "modal.plan.not_created_badge": "Empty",
            "modal.plan.view_btn": "View this plan →",
            "modal.plan.setup_btn": "+ Setup this plan",
            "modal.plan.rename_btn": "Rename (Slot {slot})",
            "modal.plan.delete_btn": "Delete plan (Slot {slot})",
            "modal.plan.default_plan": "Learning Plan",
            "modal.plan.empty_slot": "Empty Plan Slot",

            // Daily & Tasks View
            "view.daily.chapter_sub": "Loading schedule...",
            "view.daily.chapter_title": "Today's Schedule",
            "view.daily.no_tasks": "No tasks scheduled for this day. Take a rest or choose another date!",
            "view.daily.prev_day": "‹ Prev Day",
            "view.daily.next_day": "Next Day ›",
            "view.daily.today": "Today",
            "view.daily.start_timer": "Start Timer",
            "view.daily.rename_task": "Rename Task",
            "view.daily.notes_subtasks": "Notes & Subtasks",
            "view.daily.add_subtask_ph": "Add subtask…",
            "view.daily.add_subtask_btn": "Add",
            "view.daily.note_ph": "Execution notes…",
            "view.daily.completed": "Completed",
            "view.daily.in_progress": "In Progress",
            "view.daily.pending": "Pending",
            "view.daily.actual_time": "Actual time:",
            "view.daily.today_badge": "Today",
            "view.daily.rest_day_title": "Rest Day / No Schedule",

            // Table of Contents
            "nav.toc_sub": "Complete Roadmap",
            "nav.toc_title": "Table of Contents",

            // Import View
            "nav.import_sub": "PLAN.md Importer",
            "nav.import_title": "Import Plan From AI",

            // Review View
            "nav.review_sub": "Review & Adaptation",
            "nav.review_title": "Intelligent Plan Adaptation",

            // Guide View
            "nav.guide_sub": "Quick Guide",
            "nav.guide_title": "How to Generate PLAN.md with AI",

            // Lock Screen
            "lock.heading": "Protected Plan",
            "lock.subtitle": "This plan is protected by a PIN.",
            "lock.prompt": "Enter PIN to unlock this plan:",
            "lock.placeholder": "Security PIN",
            "lock.btn_unlock": "Unlock",
            "lock.wrong_pin": "Incorrect PIN. Please try again.",

            // Toast messages
            "toast.lang_switched": "Language switched to English"
        }
    },

    /**
     * Day names translation mapping
     */
    dayNames: {
        vi: {
            'monday': 'Thứ Hai',
            'tuesday': 'Thứ Ba',
            'wednesday': 'Thứ Tư',
            'thursday': 'Thứ Năm',
            'friday': 'Thứ Sáu',
            'saturday': 'Thứ Bảy',
            'sunday': 'Chủ Nhật'
        },
        en: {
            'monday': 'Monday',
            'tuesday': 'Tuesday',
            'wednesday': 'Wednesday',
            'thursday': 'Thursday',
            'friday': 'Friday',
            'saturday': 'Saturday',
            'sunday': 'Sunday'
        }
    },

    /**
     * Detect user's preferred language based on:
     * 1. Stored user setting (localStorage)
     * 2. Browser language (navigator.languages / navigator.language)
     * 3. Location / Timezone hints (Asia/Ho_Chi_Minh / Saigon / Vietnam)
     */
    detectLanguage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('tdp_lang');
                if (saved === 'en' || saved === 'vi') return saved;
            }
        } catch (e) {}

        // Check browser language
        let browserLang = '';
        if (typeof navigator !== 'undefined') {
            if (navigator.languages && navigator.languages.length) {
                browserLang = navigator.languages[0];
            } else if (navigator.language) {
                browserLang = navigator.language;
            }
        }
        browserLang = (browserLang || '').toLowerCase();

        if (browserLang.startsWith('vi')) {
            return 'vi';
        }

        // Check Timezone / Location hints
        try {
            if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
                if (/Ho_Chi_Minh|Saigon|Vietnam/i.test(tz)) {
                    return 'vi';
                }
            }
        } catch (e) {}

        // Default to English for international users
        return 'en';
    },

    /**
     * Get translated string by key
     */
    t(key, fallback = '') {
        const dict = this.translations[this.currentLang] || this.translations.vi;
        if (dict && dict[key] !== undefined) {
            return dict[key];
        }
        const viDict = this.translations.vi;
        if (viDict && viDict[key] !== undefined) {
            return viDict[key];
        }
        return fallback || key;
    },

    /**
     * Set active language and update UI
     */
    setLanguage(lang, notify = true) {
        if (lang !== 'en' && lang !== 'vi') lang = 'vi';
        const changed = this.currentLang !== lang;
        this.currentLang = lang;

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('tdp_lang', lang);
            }
        } catch (e) {}

        if (typeof document !== 'undefined') {
            if (document.documentElement) {
                document.documentElement.lang = lang;
            }

            // Update language switcher buttons
            const btnEn = document.getElementById('btn-lang-en');
            const btnVi = document.getElementById('btn-lang-vi');
            if (btnEn && btnEn.classList) {
                if (typeof btnEn.classList.toggle === 'function') {
                    btnEn.classList.toggle('is-active', lang === 'en');
                } else if (lang === 'en') {
                    if (btnEn.classList.add) btnEn.classList.add('is-active');
                } else {
                    if (btnEn.classList.remove) btnEn.classList.remove('is-active');
                }
            }
            if (btnVi && btnVi.classList) {
                if (typeof btnVi.classList.toggle === 'function') {
                    btnVi.classList.toggle('is-active', lang === 'vi');
                } else if (lang === 'vi') {
                    if (btnVi.classList.add) btnVi.classList.add('is-active');
                } else {
                    if (btnVi.classList.remove) btnVi.classList.remove('is-active');
                }
            }

            this.applyTranslations();

            // Refresh dynamic views if App is ready
            if (typeof App !== 'undefined') {
                if (App.updateHeaderPlanLabel) App.updateHeaderPlanLabel();
                if (App.planData) {
                    if (App.renderDailyView) App.renderDailyView();
                    if (App.renderTocView && App.currentView === 'toc') App.renderTocView();
                }
                if (notify && changed && App.showToast) {
                    App.showToast(this.t('toast.lang_switched'));
                }
            }

            // Dispatch custom event
            if (typeof CustomEvent === 'function' && typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
                document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
            }
        }
    },

    /**
     * Apply translations to all DOM elements marked with data-i18n attributes
     */
    applyTranslations() {
        if (typeof document === 'undefined') return;
        const dict = this.translations[this.currentLang] || this.translations.vi;

        // 1. Text elements: data-i18n="key"
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                el.textContent = dict[key];
            }
        });

        // 2. HTML elements: data-i18n-html="key"
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        });

        // 3. Placeholders: data-i18n-placeholder="key"
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) {
                el.placeholder = dict[key];
            }
        });

        // 4. Tooltips/Titles: data-i18n-title="key"
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (dict[key] !== undefined) {
                el.title = dict[key];
            }
        });

        // 5. Aria Labels: data-i18n-aria="key"
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            if (dict[key] !== undefined) {
                el.setAttribute('aria-label', dict[key]);
            }
        });
    },

    /**
     * Initialize i18n
     */
    init() {
        const detected = this.detectLanguage();
        this.setLanguage(detected, false);
    }
};

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => I18n.init());
    } else {
        I18n.init();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
