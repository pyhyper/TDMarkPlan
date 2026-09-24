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
            "nav.toc": "Mục lục",
            "nav.tasks": "Nhiệm vụ",
            "nav.journal": "Nhật ký",
            "nav.wizard": "Lập kế hoạch",
            "nav.import": "Nhập PLAN.md",
            "nav.stats": "Đánh giá & điều chỉnh",
            "nav.guide": "Định dạng",
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

            // Task status options & actions
            "view.daily.status_pending": "Chưa làm",
            "view.daily.status_in_progress": "Đang làm",
            "view.daily.status_completed": "Hoàn thành",
            "view.daily.status_skipped": "Bỏ qua",
            "view.daily.status_failed": "Thất bại",
            "view.daily.target": "Mục tiêu",
            "view.daily.rename_btn": "Đổi tên",
            "view.daily.mark_completed": "Đánh dấu hoàn thành",
            "view.daily.mark_uncompleted": "Đánh dấu chưa hoàn thành",

            // Subtasks
            "subtask.heading": "Việc nhỏ",
            "subtask.completed_count": "hoàn thành",
            "subtask.delete_tooltip": "Xóa việc nhỏ này",
            "subtask.delete_label": "Xóa việc nhỏ",
            "subtask.delete_confirm_title": "Xóa việc nhỏ",
            "subtask.delete_confirm_msg": 'Bạn có chắc chắn muốn xóa việc nhỏ "{title}" không?',
            "subtask.delete_btn": "Xóa việc nhỏ",
            "subtask.deleted_toast": "Đã xóa việc nhỏ",
            "subtask.input_placeholder": "Ví dụ: Luyện Speaking Part 1 trong 10 phút",
            "subtask.input_aria": "Tên việc nhỏ mới",
            "subtask.add_btn": "+ Thêm việc nhỏ",
            "subtask.limit_error": "Tối đa 100 việc nhỏ cho mỗi task.",

            // Task Journal & Notes
            "journal.description_heading": "Mô tả công việc",
            "journal.description_placeholder": "Mục tiêu, hướng dẫn, tiêu chí hoàn thành…",
            "journal.save_description": "Lưu mô tả",
            "journal.note_prefix": "Ghi chú",
            "journal.delete_note": "Xóa ghi chú",
            "journal.note_placeholder": "Kết quả, điều học được, khó khăn… (Tô đen rồi bấm màu để đánh dấu)",
            "journal.add_note": "+ Thêm ghi chú",
            "journal.max_notes": "Đã đủ 2 ghi chú",
            "journal.save_notes": "Lưu ghi chú",
            "journal.saving": "Đang lưu…",
            "journal.saved": "Đã lưu",
            "journal.unsaved": "Chưa lưu",
            "journal.unsaved_changes": "Còn thay đổi chưa lưu",
            "journal.save_failed": "Chưa lưu được. Hãy thử lại.",
            "journal.auto_delete_tooltip": "Thời gian tự động xóa ghi chú",
            "journal.delete_note_title": "Xóa ghi chú",
            "journal.delete_note_confirm": "Bạn có chắc chắn muốn xóa ghi chú này không?",
            "journal.delete_note_ok": "Xóa ghi chú",
            "journal.deleted_toast": "Đã xóa ghi chú",
            "journal.color_yellow": "Màu vàng (Vàng nhạt)",
            "journal.color_blue": "Màu xanh dương (Dusk Blue)",
            "journal.color_pink": "Màu hồng (Candy Pink)",
            "journal.color_green": "Màu xanh lá (Misty Green)",
            "journal.color_red": "Màu đỏ (Cayenne Red)",
            "journal.color_clear": "Xóa màu đánh dấu",
            "journal.btn_preview": "Xem trước",
            "journal.btn_edit": "Chỉnh sửa",
            "journal.expired": "Đã hết hạn",

            // Import View
            "import.sub_heading": "Công Cụ Nhập Kế Hoạch",
            "import.heading": "Nhập PLAN.md",
            "import.drop_title": "Kéo & thả file PLAN.md vào đây",
            "import.drop_sub": "hoặc bấm để chọn file từ máy tính của bạn",
            "import.paste_label": "Hoặc dán nội dung Markdown trực tiếp:",
            "import.paste_placeholder": "Dán nội dung PLAN.md do ChatGPT hoặc Gemini tạo vào đây...",
            "import.valid_plan": "✓ File PLAN.md Hợp Lệ",
            "import.invalid_plan": "⚠️ Lỗi Định Dạng PLAN.md:",
            "import.field_title": "Tiêu đề:",
            "import.field_start_date": "Ngày bắt đầu:",
            "import.field_duration": "Thời lượng:",
            "import.field_tasks": "Nhiệm vụ:",
            "import.field_total_mins": "phút tổng",
            "import.pin_label": "Bảo vệ link bằng mã PIN / Mật khẩu (Tùy chọn):",
            "import.pin_placeholder": "Ví dụ: 1234 (để trống nếu muốn link mở tự do)",
            "import.pin_help": "Nếu đặt PIN, người xem link cần nhập mã này để xem hoặc hoàn thành nhiệm vụ.",
            "import.sample_label": "Nạp mẫu nhanh:",
            "import.sample_ielts": "IELTS 6.5 (12 Tuần)",
            "import.sample_coding": "Lập Trình Full-Stack",
            "import.sample_fitness": "Tập Chạy 5K",
            "import.btn_import": "Nhập Kế Hoạch & Bắt Đầu Học Ngay →",
            "import.saving": "Đang lưu kế hoạch...",
            "import.saved_success": "Kế hoạch đã lưu thành công!",
            "import.save_error": "Lỗi lưu kế hoạch",
            "import.sample_loaded": 'Đã nạp mẫu vào khung soạn thảo. Bấm "Nhập Kế Hoạch" để kích hoạt.',
            "import.validation_failed": "Kiểm tra định dạng PLAN.md không thành công:",

            // Wizard Step 4
            "wizard.step4_heading": "Bước 2: Dán Kết Quả Markdown Từ AI & Bắt Đầu Học",
            "wizard.step4_desc": "Sau khi ChatGPT hoặc Gemini trả lời, bạn bấm nút copy code block Markdown và dán vào đây:",
            "wizard.btn_import_start": "Nhập Kế Hoạch & Bắt Đầu Học Ngay →",

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
            "nav.import": "Import PLAN.md",
            "nav.stats": "Review & Adaptation",
            "nav.guide": "Format Guide",
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

            // Task status options & actions
            "view.daily.status_pending": "Pending",
            "view.daily.status_in_progress": "In Progress",
            "view.daily.status_completed": "Completed",
            "view.daily.status_skipped": "Skipped",
            "view.daily.status_failed": "Failed",
            "view.daily.target": "Target",
            "view.daily.rename_btn": "Rename",
            "view.daily.mark_completed": "Mark as completed",
            "view.daily.mark_uncompleted": "Mark as incomplete",

            // Subtasks
            "subtask.heading": "Subtasks",
            "subtask.completed_count": "completed",
            "subtask.delete_tooltip": "Delete this subtask",
            "subtask.delete_label": "Delete subtask",
            "subtask.delete_confirm_title": "Delete Subtask",
            "subtask.delete_confirm_msg": 'Are you sure you want to delete subtask "{title}"?',
            "subtask.delete_btn": "Delete Subtask",
            "subtask.deleted_toast": "Subtask deleted",
            "subtask.input_placeholder": "e.g., Practice Speaking Part 1 for 10 mins",
            "subtask.input_aria": "New subtask title",
            "subtask.add_btn": "+ Add Subtask",
            "subtask.limit_error": "Maximum 100 subtasks per task.",

            // Task Journal & Notes
            "journal.description_heading": "Task Description",
            "journal.description_placeholder": "Goals, instructions, completion criteria…",
            "journal.save_description": "Save Description",
            "journal.note_prefix": "Note",
            "journal.delete_note": "Delete note",
            "journal.note_placeholder": "Takeaways, results, obstacles… (Highlight text to apply colors)",
            "journal.add_note": "+ Add Note",
            "journal.max_notes": "Max 2 notes reached",
            "journal.save_notes": "Save Notes",
            "journal.saving": "Saving…",
            "journal.saved": "Saved",
            "journal.unsaved": "Unsaved",
            "journal.unsaved_changes": "Unsaved changes",
            "journal.save_failed": "Failed to save. Please try again.",
            "journal.auto_delete_tooltip": "Note auto-delete timer",
            "journal.delete_note_title": "Delete Note",
            "journal.delete_note_confirm": "Are you sure you want to delete this note?",
            "journal.delete_note_ok": "Delete Note",
            "journal.deleted_toast": "Note deleted",
            "journal.color_yellow": "Butter Yellow",
            "journal.color_blue": "Dusk Blue",
            "journal.color_pink": "Candy Pink",
            "journal.color_green": "Misty Green",
            "journal.color_red": "Cayenne Red",
            "journal.color_clear": "Clear highlight",
            "journal.btn_preview": "Preview",
            "journal.btn_edit": "Edit",
            "journal.expired": "Expired",

            // Import View
            "import.sub_heading": "AI Import Engine",
            "import.heading": "Import PLAN.md",
            "import.drop_title": "Drag & drop your PLAN.md here",
            "import.drop_sub": "or click to browse from your computer",
            "import.paste_label": "Or paste Markdown directly:",
            "import.paste_placeholder": "Paste your standardized PLAN.md generated by ChatGPT or Gemini here...",
            "import.valid_plan": "✓ Valid PLAN.md Format",
            "import.invalid_plan": "⚠️ PLAN.md Format Errors:",
            "import.field_title": "Title:",
            "import.field_start_date": "Start date:",
            "import.field_duration": "Duration:",
            "import.field_tasks": "Tasks:",
            "import.field_total_mins": "total mins",
            "import.pin_label": "Protect Dynamic Link with Password / PIN (Optional):",
            "import.pin_placeholder": "e.g. 1234 or a secret password (leave empty for public link)",
            "import.pin_help": "If set, anyone visiting this dynamic link must enter this passcode to view or check off tasks.",
            "import.sample_label": "Load Sample:",
            "import.sample_ielts": "IELTS 6.5 (12 Weeks)",
            "import.sample_coding": "Full-Stack Dev",
            "import.sample_fitness": "Fitness 5K",
            "import.btn_import": "Import & Start Learning →",
            "import.saving": "Saving plan...",
            "import.saved_success": "Plan saved successfully!",
            "import.save_error": "Error saving plan",
            "import.sample_loaded": 'Sample loaded into editor. Click "Import" to activate.',
            "import.validation_failed": "PLAN.md format validation failed:",

            // Wizard Step 4
            "wizard.step4_heading": "Step 2: Paste AI Markdown Output & Start Learning",
            "wizard.step4_desc": "Once ChatGPT or Gemini responds, click the copy code button on the Markdown block and paste here:",
            "wizard.btn_import_start": "Import Plan & Start Learning Now →",

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

            // Preserve dynamic link slug
            if (typeof App !== 'undefined') {
                const planId = App.currentPlanId || (App.planData && App.planData.plan_id);
                if (planId) {
                    const linkSlug = document.getElementById('dynamic-link-slug');
                    if (linkSlug) linkSlug.textContent = `/${planId}`;
                }
            }

            // Refresh dynamic views if App is ready
            if (typeof App !== 'undefined') {
                if (App.updateHeaderPlanLabel) App.updateHeaderPlanLabel();
                if (App.planData) {
                    const finance = App.planData.domain === 'finance';
                    const notebook = App.planData.domain === 'notebook';
                    const todayLabelKey = finance ? 'nav.finance_today' : notebook ? 'nav.notebook_today' : 'nav.today';
                    const todayLabelEl = document.querySelector('[data-tab="today"] .nav-label');
                    if (todayLabelEl) {
                        todayLabelEl.setAttribute('data-i18n', todayLabelKey);
                        todayLabelEl.textContent = this.t(todayLabelKey);
                    }
                    const exportLabelKey = finance ? 'nav.export_finance' : notebook ? 'nav.export_notes' : 'nav.export';
                    const exportLabelEl = document.getElementById('export-label');
                    if (exportLabelEl) {
                        exportLabelEl.setAttribute('data-i18n', exportLabelKey);
                        exportLabelEl.textContent = this.t(exportLabelKey);
                    }
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
            if (el.id === 'dynamic-link-slug') return; // NEVER overwrite dynamic link slug
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
