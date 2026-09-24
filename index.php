<?php
/**
 * AI Plan Executor — E-Reader Edition (Kindle Paperwhite & Kobo Color)
 * Lightweight, zero-dependency PHP/HTML app for Shared Hosting or Local Server.
 */
require_once __DIR__ . '/config.php';
header('Cache-Control: no-store, private');
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
$requestedPlan = $_GET['p'] ?? $_GET['plan'] ?? '';
if (!$requestedPlan) {
    $route = trim(substr(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), strlen($basePath)), '/');
    if ($route !== 'index.php') $requestedPlan = sanitize_plan_id($route);
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <base href="<?php echo htmlspecialchars($basePath, ENT_QUOTES); ?>">
    <script>window.PLAN_ROUTE = <?php echo json_encode($requestedPlan, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;</script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TDMarkPlan — Markdown TodoList & Plan Executor</title>
    <link rel="stylesheet" href="assets/css/ereader.css?v=<?php echo filemtime(__DIR__ . '/assets/css/ereader.css'); ?>">
    <link rel="icon" href="assets/favicon.svg">
</head>
<body class="theme-kobo">

<div class="ereader-container">

    <!-- 1. Top Kindle / Kobo Bezel Bar -->
    <header class="ereader-header">
        <div class="title-badge" id="plan-title-badge-wrap">
            <span data-icon="book" aria-hidden="true"></span>
            <span id="plan-title-display" title="Bấm để đổi tiêu đề kế hoạch" data-i18n-title="header.edit_title_tooltip" onclick="App.openPlanTitleEditor()">TDMarkPlan</span>
            <button type="button" class="plan-title-edit-btn" id="btn-edit-plan-title" onclick="App.openPlanTitleEditor()" aria-label="Đổi tiêu đề kế hoạch" title="Đổi tiêu đề kế hoạch" data-i18n-title="header.edit_title_btn" data-i18n-aria="header.edit_title_btn">
                <span data-icon="edit" aria-hidden="true"></span>
            </button>
        </div>

        <!-- Dynamic Link Pill -->
        <div class="dynamic-link-badge" id="dynamic-link-pill">
            <button type="button" class="dynamic-link-copy" onclick="App.copyDynamicLink()" title="Copy link" data-i18n-title="header.copy_link_tooltip" aria-label="Copy link hiện tại" data-i18n-aria="header.copy_link_tooltip">
            <span data-icon="link" aria-hidden="true"></span>
            <span id="dynamic-link-slug" data-i18n="header.generating_link">Đang tạo link…</span>
            <span style="font-size:0.7rem; color:var(--ink-muted);" data-i18n="header.copy_label">[Copy]</span>
            </button>
            <button type="button" class="link-edit-button" id="btn-edit-link" onclick="App.openLinkEditor()" aria-label="Sửa link" data-i18n-aria="header.edit_link_btn" title="Sửa link" data-i18n-title="header.edit_link_btn"><span data-icon="edit" aria-hidden="true"></span></button>
        </div>

        <div class="ereader-controls">
            <!-- Language Switcher EN / VN -->
            <div class="lang-switcher" id="lang-switcher" role="group" aria-label="Language / Ngôn ngữ">
                <button type="button" class="lang-btn" id="btn-lang-en" onclick="I18n.setLanguage('en')" title="English">EN</button>
                <span class="lang-divider">/</span>
                <button type="button" class="lang-btn is-active" id="btn-lang-vi" onclick="I18n.setLanguage('vi')" title="Tiếng Việt">VN</button>
            </div>

            <!-- Font Size Adjusters -->
            <button class="control-btn" id="btn-font-minus" title="Smaller font size" data-i18n-title="header.smaller_font">A-</button>
            <button class="control-btn" id="btn-font-plus" title="Larger font size" data-i18n-title="header.larger_font">A+</button>

            <!-- Theme Palette Swatch Indicator (6 Màu Cơ Bản) -->
            <div class="palette-swatch-bar" id="header-palette-swatches" title="6 màu cơ bản: Vàng, Xanh dương, Hồng, Xanh lá, Đỏ, Đen" data-i18n-title="header.six_colors" aria-label="6 màu cơ bản" data-i18n-aria="header.six_colors">
                <span class="palette-dot dot-yellow" title="Màu vàng (Butter Yellow)"></span>
                <span class="palette-dot dot-blue" title="Màu xanh dương (Dusk Blue)"></span>
                <span class="palette-dot dot-pink" title="Màu hồng (Candy Pink)"></span>
                <span class="palette-dot dot-green" title="Màu xanh lá (Misty Green)"></span>
                <span class="palette-dot dot-red" title="Màu đỏ (Cayenne Red)"></span>
                <span class="palette-dot dot-black" title="Màu đen (Black Pen)"></span>
            </div>

            <!-- Theme Mode Switcher -->
            <select class="control-btn" id="theme-select" title="Màu giao diện" aria-label="Màu giao diện">
                <option value="kobo" selected data-i18n="header.theme_kobo">Màu đa sắc (Bút & Màu đánh dấu)</option>
                <option value="paper" data-i18n="header.theme_paper">Màu giấy (Warm Paper)</option>
                <option value="black" data-i18n="header.theme_black">Màu đen (Black)</option>
            </select>

            <!-- Plan Selector & Manager (Icon con mắt ở header) -->
            <button class="control-btn" id="btn-header-plan" onclick="App.openPlanModal()" title="Xem & chọn Plan (Chuyển đổi hoặc tạo plan)" aria-label="Xem & chọn Plan">
                <span id="header-plan-icon" data-icon="eye" aria-hidden="true"></span> <span id="header-plan-label"><span class="header-plan-slot">Plan 1</span><span class="header-plan-title"></span></span>
            </button>

            <!-- Password Lock Indicator & Settings -->
            <button class="control-btn" id="btn-lock-settings" onclick="App.openPasswordModal()" title="Manage password protection for this plan">
                <span id="lock-icon-indicator" data-icon="unlock" aria-hidden="true"></span> <span id="lock-label-indicator">Set PIN</span>
            </button>
        </div>
    </header>

    <section id="workspace-deck" class="workspace-deck" hidden aria-label="Hai plan của bạn">
        <details id="plan-card-1" class="workspace-card"><summary id="plan-summary-1"><span>01</span><strong id="plan-title-1">Plan 1</strong><small data-i18n="common.expand_collapse">Mở / thu gọn</small></summary><div id="plan-holder-1"></div></details>
        <details id="plan-card-2" class="workspace-card"><summary id="plan-summary-2"><span>02</span><strong id="plan-title-2">Thêm plan thứ hai</strong><small data-i18n="common.expand_collapse">Mở / thu gọn</small></summary><div id="plan-holder-2"></div></details>
    </section>
    <div id="single-plan-host"><div id="plan-surface">

    <!-- 2. E-Reader Navigation Menu -->
    <nav class="ereader-nav">
        <a href="#today" class="nav-tab active" data-tab="today">
            <span data-icon="book" aria-hidden="true"></span><span class="nav-label" data-i18n="nav.today">Hôm nay</span>
        </a>
        <a href="#wizard" class="nav-tab" data-tab="wizard">
            <span data-icon="spark" aria-hidden="true"></span><span class="nav-label" data-i18n="nav.wizard">Lập kế hoạch</span>
        </a>
        <a href="#toc" class="nav-tab" data-tab="toc">
            <span data-icon="list" aria-hidden="true"></span><span class="nav-label" data-i18n="nav.toc">Mục lục</span>
        </a>
        <a href="#import" class="nav-tab" data-tab="import">
            <span data-icon="upload" aria-hidden="true"></span><span class="nav-label" data-i18n="nav.import">Nhập PLAN.md</span>
        </a>
        <a href="#stats" class="nav-tab" data-tab="stats">
            <span data-icon="chart" aria-hidden="true"></span><span class="nav-label" data-i18n="nav.review_title">Đánh giá & điều chỉnh</span>
        </a>
        <a href="#guide" class="nav-tab" data-tab="guide">
            <span data-icon="info" aria-hidden="true"></span><span class="nav-label" data-i18n="nav.guide_title">Định dạng</span>
        </a>
    </nav>

    <!-- 3. Main Reading Page Body -->
    <main class="ereader-body">

        <!-- Focus Timer Card (Hidden until activated) -->
        <div class="focus-timer-card" id="focus-timer-card" style="display:none;">
            <div class="timer-info">
                <span class="timer-label">Focus Session Active</span>
                <span class="timer-task-title" id="timer-task-title">Task Title</span>
            </div>
            <div class="timer-display">
                <div class="timer-digits" id="timer-digits">25:00</div>
                <div class="timer-actions">
                    <button class="btn-timer" id="timer-pause-btn" onclick="App.toggleTimerPause()">Pause</button>
                    <button class="btn-timer btn-timer-secondary" onclick="App.finishTimerEarly()">Finish Early</button>
                    <button class="btn-timer btn-timer-secondary" onclick="App.resetTimer()">Reset</button>
                </div>
            </div>
        </div>

        <!-- ================= VIEW: LOCKED PASSCODE SCREEN ================= -->
        <section class="view-panel" id="view-locked">
            <div class="lock-screen-card">
                <div class="lock-screen-icon" data-icon="lock" aria-hidden="true"></div>
                <h1 class="lock-screen-title" id="locked-plan-title">Protected Plan</h1>
                <p class="lock-screen-desc">
                    Nhập PIN để xem dữ liệu. Bạn cần nhập lại PIN mỗi lần tải lại hoặc mở trang.
                </p>
                <form id="unlock-form" onsubmit="App.submitUnlock(event)">
                    <div style="margin-bottom:0.75rem;">
                        <input type="password" id="unlock-password" class="input-passcode" placeholder="Nhập PIN..." autocomplete="off" required autofocus>
                    </div>
                    <div id="unlock-error" class="unlock-error-msg" style="display:none;"></div>
                    <button type="submit" class="btn-primary" style="width:100%;">
                        Unlock Plan →
                    </button>
                </form>
            </div>
        </section>

        <!-- ================= VIEW: AI PLAN SETUP WIZARD ================= -->
        <section class="view-panel" id="view-wizard">
            <div class="chapter-header">
                <div class="chapter-sub">Trình Thiết Lập Kế Hoạch & Prompt AI</div>
                <h1 class="chapter-title">Chọn Lĩnh Vực & Tạo Prompt</h1>
            </div>

            <p id="existing-plan-message" hidden>Plan này đã được lưu. Mở ô plan thứ hai để tạo thêm (tối đa 2 plan mỗi link). Để tiếp tục dự án hiện tại, dùng Đánh giá & điều chỉnh hoặc nhập lịch cập nhật.</p>
            <div id="wizard-config">
            <p id="plan-slot-label">Tạo plan đầu tiên</p>
            <section class="import-card blank-plan-setup">
                <h2>Chỉ cần nơi ghi chú?</h2><p>Tạo plan trống, không lịch và không task. Có tối đa 2 ghi chú mở/thu gọn.</p>
                <label class="form-label" for="blank-plan-title">Tên sổ ghi chú</label><input id="blank-plan-title" class="form-input" maxlength="200" placeholder="Ý tưởng, nhật ký, ghi chép dự án…">
                <label class="form-label" for="blank-plan-auto-delete" style="margin-top:0.5rem; display:block;">Thời gian tự động xóa sổ (Auto-delete):</label>
                <select id="blank-plan-auto-delete" class="form-select" style="margin-bottom:0.75rem;">
                    <option value="90" selected>Sau 90 ngày (Mặc định)</option>
                    <option value="0">Không bao giờ</option>
                    <option value="1">Sau 24 giờ</option>
                    <option value="7">Sau 7 ngày</option>
                    <option value="30">Sau 30 ngày</option>
                </select>
                <button type="button" class="btn-sample" onclick="Workspace.createNotebook(this)">Tạo plan trống để ghi chú</button>
            </section>
            <p>Hôm nay: <strong id="wizard-today"></strong> · Múi giờ Việt Nam</p>
            <p class="plan-wizard-only">Chọn lĩnh vực → thiết lập lịch → copy prompt vào ChatGPT / Gemini → nhập PLAN.md → làm task và ghi nhật ký → xuất để AI điều chỉnh.</p>
            <p><a href="index.php">＋ Tạo kế hoạch mới với link ngẫu nhiên</a>. Mở lại link đã lưu để tiếp tục kế hoạch cũ.</p>
            <section id="finance-onboarding" class="import-card" hidden>
                <h2>Tài chính của bạn</h2>
                <p>Trả lời câu hỏi về thói quen và mục tiêu, sau đó theo dõi thu chi, ghi chú và tiến độ FIRE.</p>
                <button class="btn-sample" onclick="Finance.open()">Trả lời câu hỏi & thiết lập</button>
                <button id="btn-start-finance" class="btn-primary" hidden onclick="Finance.start(this)">Tạo bảng theo dõi thu chi</button>
                <label for="finance-pin">PIN bảo vệ (tùy chọn)</label>
                <input id="finance-pin" type="password" class="form-input" autocomplete="new-password" placeholder="Nhập PIN để bảo vệ dữ liệu">
                <p id="finance-setup-summary"></p>
            </section>
            <!-- 1. Domain Selector Cards -->
            <label style="display:block; font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--ink-secondary); margin-bottom:0.6rem; font-family:var(--font-sans);">
                1. Chọn Lĩnh Vực Của Bạn:
            </label>
            <div class="domain-cards-grid">
                <div class="domain-card active" data-domain="ielts" onclick="App.selectDomain('ielts', true)">
                    <div class="domain-icon" data-icon="study" aria-hidden="true"></div>
                    <div class="domain-title">Học Tập & IELTS</div>
                    <div class="domain-desc">Luyện thi IELTS 6.5, tiếng Anh, học từ vựng, ngữ pháp.</div>
                </div>
                <div class="domain-card" data-domain="fitness" onclick="App.selectDomain('fitness', true)">
                    <div class="domain-icon" data-icon="fitness" aria-hidden="true"></div>
                    <div class="domain-title">Gym & Thể Hình</div>
                    <div class="domain-desc">Tăng cơ, giảm mỡ, chạy bộ 5K, rèn luyện thể lực hàng ngày.</div>
                </div>
                <div class="domain-card" data-domain="vibecode" onclick="App.selectDomain('vibecode', true)">
                    <div class="domain-icon" data-icon="code" aria-hidden="true"></div>
                    <div class="domain-title">Vibe Coding & Lập Trình</div>
                    <div class="domain-desc">Web app, PHP, shared hosting, Python và ứng dụng AI.</div>
                </div>
                <div class="domain-card" data-domain="finance" onclick="App.selectDomain('finance', true)"><div class="domain-icon" data-icon="wallet" aria-hidden="true"></div><div class="domain-title">Tài Chính & FIRE</div><div class="domain-desc">Thu chi, quỹ dự phòng, độc lập và tự do tài chính.</div></div>
                <div class="domain-card" data-domain="custom" onclick="App.selectDomain('custom', true)">
                    <div class="domain-icon" data-icon="target" aria-hidden="true"></div>
                    <div class="domain-title">Tùy Chọn Khác</div>
                    <div class="domain-desc">Kế hoạch đọc sách, tài chính cá nhân, dự án riêng.</div>
                </div>
            </div>

            <div class="import-card">
                <label class="form-label" for="custom-plan-link">Tên link riêng (chữ thường, số, dấu gạch ngang)</label>
                <div class="subtask-add"><input class="form-input" id="custom-plan-link" maxlength="64" placeholder="Ví dụ: ke-hoach-cua-tan"><button class="btn-sample" type="button" onclick="App.applyCustomLink(this)">Dùng link này</button></div>
                <p id="custom-link-feedback" role="status">Để trống để dùng link ngẫu nhiên. Tên đã có người dùng sẽ không bị ghi đè.</p>
            </div>
            <!-- 2. Parameter Setup Form -->
            <div id="wizard-step-setup" class="import-card plan-wizard-only" style="margin-bottom:1.5rem;">
                <label style="display:block; font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--ink-secondary); margin-bottom:0.75rem; font-family:var(--font-sans);">
                    2. Thiết Lập Thời Gian & Mục Tiêu Cá Nhân:
                </label>
                <div class="wizard-form-grid">
                    <div class="form-group">
                        <label class="form-label">Tiêu đề kế hoạch:</label>
                        <input type="text" id="wiz-title" class="form-input" value="Luyện thi IELTS 6.5 Cấp Tốc">
                    </div>
                    <div class="form-group">
                        <label class="form-label"> Ngày bắt đầu:</label>
                        <input type="date" id="wiz-start-date" class="form-input" value="<?php echo date('Y-m-d'); ?>">
                    </div>
                    <div class="form-group">
                        <label class="form-label"> Khoảng thời gian:</label>
                        <select id="wiz-duration" class="form-select">
                            <option value="1">1 Tuần — đợt làm việc ngắn</option>
                            <option value="2">2 Tuần</option>
                            <option value="4">4 Tuần (1 Tháng)</option>
                            <option value="6">6 Tuần</option>
                            <option value="8">8 Tuần (2 Tháng)</option>
                            <option value="12" selected>12 Tuần (3 Tháng)</option>
                            <option value="16">16 Tuần (4 Tháng)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label"> Thời gian mỗi ngày:</label>
                        <select id="wiz-minutes" class="form-select">
                            <option value="30">30 phút / ngày</option>
                            <option value="45">45 phút / ngày</option>
                            <option value="60">60 phút / ngày</option>
                            <option value="90" selected>90 phút / ngày</option>
                            <option value="120">120 phút / ngày</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label"> Các ngày học trong tuần:</label>
                        <select id="wiz-days" class="form-select">
                            <option value="mon,tue,wed,thu,fri" selected>Thứ 2 → Thứ 6 (Nghỉ cuối tuần)</option>
                            <option value="mon,tue,wed,thu,fri,sat">Thứ 2 → Thứ 7</option>
                            <option value="mon,wed,fri,sun">Thứ 2, 4, 6 & Chủ Nhật</option>
                            <option value="mon,tue,wed,thu,fri,sat,sun">Cả tuần (7 ngày)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="wiz-current-level"> Trình độ hiện tại & Thiết lập kỹ năng:</label>
                        <button type="button" id="btn-ielts-level" class="btn-skill-setup skill-btn-ielts" onclick="App.openIeltsModal()">
                            <span class="skill-btn-lead">
                                <span data-icon="study" aria-hidden="true"></span>
                                <span class="skill-btn-title">Chọn trình độ & kỹ năng IELTS</span>
                            </span>
                            <span class="skill-btn-badge">Tùy chỉnh ↗</span>
                        </button>
                        <button type="button" id="btn-fitness-setup" class="btn-skill-setup skill-btn-fitness" hidden onclick="document.getElementById('fitness-setup-modal').showModal()">
                            <span class="skill-btn-lead">
                                <span data-icon="fitness" aria-hidden="true"></span>
                                <span class="skill-btn-title">Chọn lịch tập & ăn uống</span>
                            </span>
                            <span class="skill-btn-badge">Tùy chỉnh ↗</span>
                        </button>
                        <button type="button" id="btn-code-setup" class="btn-skill-setup skill-btn-vibecode" hidden onclick="document.getElementById('code-setup-modal').showModal()">
                            <span class="skill-btn-lead">
                                <span data-icon="code" aria-hidden="true"></span>
                                <span class="skill-btn-title">Chọn nền tảng & dự án Vibe Code</span>
                            </span>
                            <span class="skill-btn-badge">Tùy chỉnh ↗</span>
                        </button>
                        <button type="button" id="btn-finance-setup" class="btn-skill-setup skill-btn-finance" hidden onclick="Finance.open()">
                            <span class="skill-btn-lead">
                                <span data-icon="wallet" aria-hidden="true"></span>
                                <span class="skill-btn-title">Thiết lập Tài chính & FIRE</span>
                            </span>
                            <span class="skill-btn-badge">Tùy chỉnh ↗</span>
                        </button>
                        <input type="text" id="wiz-current-level" class="form-input" value="Chưa biết trình độ IELTS — cần bài đánh giá đầu vào" placeholder="Nội dung sẽ tự cập nhật khi bấm tùy chỉnh bên trên...">
                    </div>
                    <div class="form-group">
                        <label class="form-label"> Mục tiêu cần đạt:</label>
                        <input type="text" id="wiz-target-goal" class="form-input" value="Đạt IELTS Overall 6.5 (Listening 6.5, Speaking 6.5)">
                    </div>
                    <div class="form-group">
                        <label class="form-label"> Mật khẩu bảo vệ link (Tùy chọn):</label>
                        <input type="password" id="wiz-password" class="form-input" placeholder="Để trống nếu muốn link mở tự do...">
                    </div>
                </div>

                <!-- Action Buttons: Generate Prompt or Instant Sample -->
                <div class="wizard-action-buttons" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; border-top:1px solid var(--border-color); padding-top:1rem;">
                    <button class="btn-primary" onclick="App.generateAiPromptFromWizard()">
                         Tạo Prompt Cho ChatGPT / Gemini →
                    </button>
                    <button class="control-btn" id="btn-wiz-instant-sample" onclick="App.useInstantSampleForDomain()" style="font-weight:600; padding:0.6rem 1rem; border-color:var(--ink-secondary);">
                         Dùng Luôn Kế Hoạch Mẫu Này (Bắt đầu từ hôm nay)
                    </button>
                </div>
            </div>

            <!-- 3. Generated Prompt & AI Links -->
            <div id="wiz-prompt-result-card" class="prompt-copy-card" style="display:none; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
                    <h3 style="font-size:1.15rem; font-weight:700; color:var(--ink-primary);">
                         Bước 1: Copy Prompt & Dán Vào AI
                    </h3>
                    <div class="ai-portal-buttons">
                        <a href="https://chatgpt.com" target="_blank" rel="noopener" class="btn-ai-portal">
                             Mở ChatGPT 
                        </a>
                        <a href="https://gemini.google.com" target="_blank" rel="noopener" class="btn-ai-portal">
                             Mở Gemini 
                        </a>
                    </div>
                </div>
                <p style="font-size:0.85rem; color:var(--ink-secondary); line-height:1.45;">
                    Prompt đã được tối ưu lệnh để yêu cầu ChatGPT/Gemini <strong>CHỈ xuất ra 1 code block Markdown duy nhất</strong> chứa chuẩn YAML frontmatter với ngày bắt đầu chính xác bạn đã chọn.
                </p>
                <textarea class="prompt-textarea" id="wiz-generated-prompt-box" readonly style="min-height:220px;"></textarea>
                <button class="btn-primary" onclick="App.copyWizardPrompt()">
                     Copy Prompt Cho ChatGPT / Gemini
                </button>
            </div>

            <!-- 4. Paste Markdown & Import Directly -->
            <div id="wiz-paste-result-card" class="import-card" style="display:none;">
                <h3 style="font-size:1.15rem; font-weight:700; color:var(--ink-primary); margin-bottom:0.5rem;">
                     Bước 2: Dán Kết Quả Markdown Từ AI & Bắt Đầu Học
                </h3>
                <p style="font-size:0.85rem; color:var(--ink-secondary); line-height:1.45; margin-bottom:0.75rem;">
                    Sau khi ChatGPT hoặc Gemini trả lời, bạn bấm nút copy code block Markdown và dán vào đây:
                </p>
                <textarea class="textarea-md" id="wiz-paste-markdown" placeholder="Dán nội dung PLAN.md do ChatGPT hoặc Gemini tạo ra vào đây..."></textarea>
                <div id="wiz-import-preview-box" style="display:none; padding:1rem; border-radius:6px; margin-bottom:1rem;"></div>
                <button class="btn-primary" onclick="App.importFromWizard()">
                     Nhập Kế Hoạch & Bắt Đầu Học Ngay →
                </button>
            </div>
            </div>
        </section>

        <!-- ================= TAB 1: TODAY'S EXECUTION ================= -->
        <section class="view-panel active" id="view-today">
            <section id="notebook-content" hidden><h1 id="notebook-title">Sổ ghi chú</h1><p>Ghi chép tự do; không cần lịch hoặc todo.</p><div id="notebook-notes"></div></section>
            <section id="finance-dashboard" hidden>
                <h1>Tài chính & FIRE</h1>
                <button class="btn-sample" onclick="Finance.open(true)">Cập nhật tài sản, mục tiêu & ghi chú</button>
                <div id="finance-content">
                    <div id="fire-bars" class="fire-grid"></div>
                    <p id="fire-assumptions"></p><p id="finance-note-display" class="journal-text"></p>
                    <p>Tham khảo: <a href="https://www.fidelity.com/learning-center/personal-finance/how-to-fi" target="_blank" rel="noopener">FIRE & tỷ lệ rút tiền</a> · <a href="https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/investor-resilience-world-investor-week-2022-investor-bulletin" target="_blank" rel="noopener">Quỹ dự phòng</a></p>
                    <details class="finance-review">
<summary>Hồ sơ & định hướng tài chính</summary>
<p id="finance-profile-summary" class="journal-text"></p>
<button type="button" class="btn-sample" onclick="Finance.generatePrompt()">Tạo câu hỏi cho ChatGPT / Gemini</button>
<p>Dựa trên câu trả lời và thu chi, bạn có thể nhờ AI phân tích rồi lưu lại định hướng tại đây.</p>
<label for="finance-ai-prompt">Prompt phân tích tài chính</label>
<textarea id="finance-ai-prompt" class="prompt-textarea" readonly></textarea>
<button type="button" class="btn-sample" onclick="Finance.copyPrompt()">Copy prompt</button>
<label for="finance-analysis">Kết quả phân tích / kế hoạch tài chính của bạn</label>
<textarea id="finance-analysis" class="task-note-textarea" placeholder="Ghi lại định hướng, ngân sách dự kiến hoặc kết quả AI trả lời…"></textarea>
<button type="button" class="btn-sample" onclick="Finance.saveAnalysis(this)">Lưu định hướng</button><span id="finance-analysis-status" role="status"></span>
</details>
<h2>Nhật ký thu chi</h2>
                    <p>Nhật ký tính dòng tiền theo tháng. Cập nhật số dư tài sản riêng sau khi đối soát; ghi thu nhập không tự cộng vào tài sản đầu tư.</p>
                    <form onsubmit="Finance.addEntry(event)" class="wizard-form-grid">
                        <label>Ngày<input class="form-input" id="money-date" type="date" required></label>
                        <label>Loại<select class="form-select" id="money-type"><option value="expense">Chi</option><option value="income">Thu</option></select></label>
                        <label>Số tiền (VND)<input class="form-input" id="money-amount" type="number" min="1" max="1000000000000000" step="1" required></label>
                        <label>Danh mục<input class="form-input" id="money-category" placeholder="Ăn uống, nhà ở, lương…" maxlength="100" required></label>
                        <label>Ghi chú<textarea class="task-note-textarea" id="money-note" placeholder="Chi cho việc gì? Bài học tài chính hôm nay…"></textarea></label>
                        <button class="btn-primary" type="submit">Lưu thu chi</button>
                    </form>
                    <label>Tháng báo cáo<input id="money-month" type="month" onchange="Finance.render()"></label>
                    <p id="cashflow-summary"></p><ul id="money-entries" class="journal-text"></ul>
                </div>
            </section>
            <div id="task-dashboard">
            <div class="chapter-header">
                <div class="chapter-sub" id="chapter-sub">
                    <span>Loading schedule...</span>
                </div>
                <h1 class="chapter-title" id="chapter-title">Today's Chapter</h1>

                <div class="chapter-date-nav">
                    <button class="nav-arrow-btn" onclick="App.navigateDate('prev')">‹ Prev Day</button>
                    <button class="nav-arrow-btn" onclick="App.navigateDate('today')">Today</button>
                    <button class="nav-arrow-btn" onclick="App.navigateDate('next')">Next Day ›</button>
                    <span class="current-date-badge" id="current-date-display">...</span>
                </div>
            </div>

            <!-- List of Tasks for this Day -->
            <div class="tasks-container" id="daily-tasks-list">
                <div class="empty-day-state">Loading tasks from PLAN.md...</div>
            </div>
            </div>
        </section>

        <!-- ================= TAB 2: TABLE OF CONTENTS (WEEKS) ================= -->
        <section class="view-panel" id="view-toc">
            <div class="chapter-header">
                <div class="chapter-sub">Complete Roadmap</div>
                <h1 class="chapter-title">Table of Contents</h1>
            </div>
            <div id="toc-container">
                <!-- Dynamically generated week blocks -->
            </div>
        </section>

        <!-- ================= TAB 3: IMPORT / PASTE PLAN.MD ================= -->
        <section class="view-panel" id="view-import">
            <div class="chapter-header">
                <div class="chapter-sub">AI Import Engine</div>
                <h1 class="chapter-title">Import PLAN.md</h1>
            </div>

            <div class="import-card">
                <!-- Dropzone -->
                <div class="dropzone" id="dropzone">
                    <div style="font-size:2rem; margin-bottom:0.4rem;"></div>
                    <div style="font-weight:600; margin-bottom:0.25rem;">Drag & drop your PLAN.md here</div>
                    <div style="font-size:0.85rem; color:var(--ink-muted);">or click to browse from your computer</div>
                    <input type="file" id="plan-file-input" accept=".md,.markdown,.txt" style="display:none;">
                </div>

                <!-- Or Paste Markdown -->
                <label style="display:block; font-family:var(--font-sans); font-size:0.875rem; font-weight:600; margin-bottom:0.5rem;">
                    Or paste Markdown directly:
                </label>
                <textarea class="textarea-md" id="import-markdown" placeholder="Paste your standardized PLAN.md generated by ChatGPT or Gemini here..."></textarea>

                <!-- Live Validation Preview Box -->
                <div id="import-preview-box" style="display:none; padding:1rem; border-radius:6px; margin-bottom:1rem;"></div>

                <!-- Optional Password Protection -->
                <div style="margin-bottom: 1.25rem; background:var(--bg-page); padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:6px;">
                    <label style="display:block; font-family:var(--font-sans); font-size:0.85rem; font-weight:600; margin-bottom:0.35rem;">
                         Protect Dynamic Link with Password / PIN (Optional):
                    </label>
                    <input type="password" id="import-password" placeholder="e.g. 1234 or a secret password (leave empty for public link)" style="width:100%; padding:0.5rem 0.75rem; border:1px solid var(--border-color); border-radius:5px; background:var(--bg-card); color:var(--ink-primary); font-family:var(--font-mono); font-size:0.85rem;">
                    <div style="font-size:0.75rem; color:var(--ink-muted); margin-top:0.25rem;">
                        If set, anyone visiting this dynamic link must enter this passcode to view or check off tasks.
                    </div>
                </div>

                <div class="import-actions">
                    <div class="sample-buttons">
                        <span>Load Sample:</span>
                        <button class="btn-sample" onclick="App.loadExamplePlan('ielts-6.5')">IELTS 6.5 (12 Weeks)</button>
                        <button class="btn-sample" onclick="App.loadExamplePlan('coding-roadmap')">Full-Stack Dev</button>
                        <button class="btn-sample" onclick="App.loadExamplePlan('fitness-5k')">Fitness 5K</button>
                    </div>
                    <button class="btn-primary" onclick="App.savePlanMarkdown(document.getElementById('import-markdown').value, null, document.getElementById('import-password').value)">
                        Import & Create Dynamic Link →
                    </button>
                </div>
            </div>
        </section>

        <!-- ================= TAB 4: REVIEW & AI ADAPTATION ================= -->
        <section class="view-panel" id="view-stats">
            <div class="chapter-header">
                <div class="chapter-sub">Performance Analytics</div>
                <h1 class="chapter-title">Review & AI Adaptation</h1>
            </div>

            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-box-title">Completion Rate</div>
                    <div class="stat-box-val" id="stat-completion-rate">0%</div>
                    <div class="stat-box-sub">Overall plan progress</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-title">Tasks Completed</div>
                    <div class="stat-box-val" id="stat-completed-tasks">0 / 0</div>
                    <div class="stat-box-sub">Executable items</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-title">Study Time</div>
                    <div class="stat-box-val" id="stat-time-spent">0h 0m</div>
                    <div class="stat-box-sub">Total actual focused time</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-title">Active Streak</div>
                    <div class="stat-box-val" id="stat-streak">0 Days</div>
                    <div class="stat-box-sub">Consecutive study days</div>
                </div>
            </div>

            <!-- AI Adaptation Section -->
            <div class="prompt-copy-card">
                <h2 style="font-size:1.25rem; font-weight:700; margin-bottom:0.5rem;"> Adapt Plan with AI</h2>
                <p style="font-size:0.9rem; color:var(--ink-secondary); line-height:1.5;">
                    The system has generated a customized performance review prompt with your exact real-life execution data (completion rates, weak areas, missed tasks). Copy this prompt and send it to <strong>ChatGPT</strong> or <strong>Gemini</strong> to generate an updated, rebalanced <code>PLAN_v2.md</code>!
                </p>
                <textarea class="prompt-textarea" id="ai-adaptation-prompt-box" readonly></textarea>
                <button class="btn-primary" onclick="App.copyAiPrompt()">
                     Copy Prompt for ChatGPT / Gemini
                </button>
            </div>
        </section>

        <!-- ================= TAB 5: AI PROMPT GUIDE ================= -->
        <section class="view-panel" id="view-guide">
            <div class="chapter-header">
                <div class="chapter-sub">Standard Format Specification</div>
                <h1 class="chapter-title">How to Generate PLAN.md with AI</h1>
            </div>

            <div style="font-size:0.95rem; line-height:1.6; color:var(--ink-secondary);">
                <p style="margin-bottom:1rem;">
                    You can ask <strong>ChatGPT</strong> or <strong>Gemini</strong> to generate a plan for any subject (English, Coding, Fitness, Reading, Finance, Certifications). Copy the master prompt below and fill in your details:
                </p>

                <div class="prompt-copy-card" style="margin-bottom:1.5rem;">
                    <div style="font-weight:600; color:var(--ink-primary); margin-bottom:0.5rem;">Master Prompt for ChatGPT / Gemini:</div>
                    <textarea class="prompt-textarea" id="master-ai-prompt" readonly style="min-height:260px;">
Create a detailed personal study/training schedule formatted strictly as a standardized PLAN.md.

My Goal: [e.g. Reach IELTS 6.5 / Learn Full-Stack Web Development / Run 5K]
Current Level: [e.g. Intermediate / Beginner]
Available Time: [e.g. 90 minutes / day]
Available Days: [e.g. Monday, Tuesday, Wednesday, Thursday, Friday]
Duration: [e.g. 12 weeks]
Weak Areas: [e.g. Speaking and Listening]
Preferences: [e.g. Practical exercises, 25-30 min focus sessions]

Format Requirements:
1. Start with YAML frontmatter containing:
---
plan_id: [unique-lowercase-slug]
title: [Plan Title]
version: 1.0
timezone: Asia/Ho_Chi_Minh
goal:
  type: general
  description: [Main goal]
schedule:
  days: [mon, tue, wed, thu, fri]
  daily_minutes: 90
start_date: YYYY-MM-DD
duration_weeks: [number]
---

2. Include Markdown sections:
# Goal
# Current Ability
# Weak Areas
# Strong Areas
# Constraints

3. Include Weekly Schedules starting with:
# Week 1
## Monday
- [ ] Task Title
  - id: [unique-task-id]
  - type: [grammar|vocabulary|speaking|listening|reading|writing|coding|exercise|review|custom]
  - duration: [minutes]
  - priority: [high|medium|low]
  - target: [optional number]
  - unit: [optional unit]
</textarea>
                    <button class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('master-ai-prompt').value); App.showToast('Master prompt copied!');">
                         Copy Master Prompt
                    </button>
                </div>
            </div>
        </section>

    </main>

    <!-- 4. Kindle Bottom Footer (Loc & Reading Progress) -->
    <footer class="ereader-footer">
        <span id="footer-loc">Loc 1 of 120</span>
        <div class="reading-progress-track">
            <div class="reading-progress-bar" id="footer-progress-bar"></div>
        </div>
        <div style="display:flex; align-items:center; gap:1rem;">
            <span id="footer-pct">0% done</span>
            <a href="#" onclick="App.exportMarkdown(); return false;" style="color:var(--ink-primary); text-decoration:underline;" title="Download updated PLAN.md with completed checkboxes">
                <span data-icon="download" aria-hidden="true"></span><span id="export-label">Xuất PLAN.md + nhật ký</span>
            </a>
        </div>
    </footer>
    </div></div>

</div>

<!-- Plan Title Edit Modal Dialog -->
<dialog id="plan-title-modal" class="ielts-dialog" aria-labelledby="plan-title-modal-title">
    <form onsubmit="event.preventDefault(); App.submitRenamePlan(document.getElementById('plan-title-input').value);">
        <div class="ielts-modal-heading">
            <h2 id="plan-title-modal-title" data-i18n="modal.title.heading">Đổi tiêu đề kế hoạch</h2>
            <button type="button" class="control-btn" aria-label="Đóng" data-i18n-aria="common.close" onclick="document.getElementById('plan-title-modal').close()">✕</button>
        </div>
        <p style="margin-bottom:0.75rem; color:var(--ink-secondary); font-size:0.85rem;" data-i18n="modal.title.desc">
            Nhập tiêu đề mới cho kế hoạch của bạn (tối đa 200 ký tự).
        </p>
        <label class="form-label" for="plan-title-input" data-i18n="modal.title.label">Tiêu đề kế hoạch</label>
        <input id="plan-title-input" class="form-input" required maxlength="200" autocomplete="off" spellcheck="false" placeholder="Ví dụ: Luyện thi IELTS 6.5 Cấp Tốc" data-i18n-placeholder="modal.title.placeholder">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
            <button type="button" class="control-btn" onclick="document.getElementById('plan-title-modal').close()" data-i18n="common.cancel">Hủy</button>
            <button type="submit" class="btn-primary" id="btn-save-plan-title" data-i18n="modal.title.btn_save">Lưu tiêu đề</button>
        </div>
    </form>
</dialog>

<!-- 5. Password Management Modal Dialog -->
<dialog id="link-edit-modal" class="ielts-dialog" aria-labelledby="link-edit-title">
    <form onsubmit="event.preventDefault(); App.applyCustomLink(event.submitter, 'link-edit-value', 'link-edit-feedback')">
        <div class="ielts-modal-heading"><h2 id="link-edit-title" data-i18n="modal.link.heading">Sửa link của bạn</h2><button type="button" class="control-btn" aria-label="Đóng" data-i18n-aria="common.close" onclick="document.getElementById('link-edit-modal').close()">✕</button></div>
        <p data-i18n="modal.link.desc">Đổi tên link dùng chung cho cả hai plan. Link cũ vẫn dẫn tới link mới.</p>
        <label class="form-label" for="link-edit-value" data-i18n="modal.link.label">Tên link</label><input id="link-edit-value" class="form-input" required maxlength="64" pattern="[a-z0-9][a-z0-9_-]{0,63}" autocomplete="off" spellcheck="false">
        <p data-i18n="modal.link.help">Dùng chữ thường không dấu, số, dấu gạch ngang hoặc gạch dưới.</p>
        <p id="link-edit-feedback" role="status"></p><button type="submit" class="btn-primary" data-i18n="modal.link.btn_save">Lưu link</button>
    </form>
</dialog>
<dialog id="fire-modal" class="ielts-dialog" aria-labelledby="fire-title"><form onsubmit="Finance.apply(event)"><div class="ielts-modal-heading"><h2 id="fire-title">Thiết lập Tài chính & FIRE</h2><button type="button" class="control-btn" aria-label="Đóng" onclick="document.getElementById('fire-modal').close()">✕</button></div><fieldset class="finance-questionnaire"><legend>Hiểu tình hình của bạn</legend>
<label class="form-label" for="fire-goal">Bạn ưu tiên điều gì?</label>
<select id="fire-goal" class="form-select"><option>Hiểu tiền đang đi đâu</option><option>Kiểm soát chi tiêu</option><option>Xây quỹ dự phòng</option><option>Giảm nợ</option><option>Độc lập tài chính / FIRE</option></select>
<label class="form-label" for="fire-habit">Bạn đang ghi chép chi tiêu thế nào?</label>
<select id="fire-habit" class="form-select"><option>Chưa ghi chép</option><option>Ghi không đều</option><option>Ghi thường xuyên nhưng chưa có ngân sách</option><option>Đã có ngân sách theo tháng</option></select>
<label class="form-label" for="fire-stability">Thu nhập của bạn</label>
<select id="fire-stability" class="form-select"><option>Ổn định theo tháng</option><option>Thay đổi theo tháng</option><option>Chưa có thu nhập đều</option></select>
<label class="form-label" for="fire-horizon">Bạn đang nhìn tới khoảng thời gian nào?</label>
<select id="fire-horizon" class="form-select"><option>1–3 tháng tới</option><option>Trong 1 năm</option><option>3–5 năm</option><option>Dài hạn / FIRE</option></select>
<label class="form-label" for="fire-question">Điều bạn muốn hỏi về tài chính</label>
<textarea id="fire-question" class="task-note-textarea" placeholder="Ví dụ: Vì sao tháng nào cũng hết tiền? Tôi nên theo dõi những khoản nào?"></textarea>
</fieldset><p>Nhập số liệu VND. 4% tương ứng 25 lần chi phí năm; bạn có thể đổi giả định. Mốc FIRE là ước tính, không đảm bảo an toàn nghỉ hưu.</p><label class="form-label" for="fire-essential">Chi phí thiết yếu mỗi tháng (VND)</label><input class="form-input" id="fire-essential" type="number" min="1" max="1000000000000000" step="1" required><label class="form-label" for="fire-lifestyle">Chi phí mức sống mong muốn mỗi tháng (VND)</label><input class="form-input" id="fire-lifestyle" type="number" min="1" max="1000000000000000" step="1" required><label class="form-label" for="fire-reserve">Quỹ dự phòng hiện có (VND)</label><input class="form-input" id="fire-reserve" type="number" min="0" max="1000000000000000" step="1" required><label class="form-label" for="fire-assets">Tài sản đầu tư, không gồm quỹ dự phòng (VND)</label><input class="form-input" id="fire-assets" type="number" min="0" max="1000000000000000" step="1" required><label class="form-label" for="fire-debt">Nợ cần khấu trừ khỏi tài sản (VND)</label><input class="form-input" id="fire-debt" type="number" min="0" max="1000000000000000" step="1" required><label class="form-label" for="fire-months">Mục tiêu quỹ dự phòng (số tháng)</label><input class="form-input" id="fire-months" type="number" min="1" max="36" step="1" required><label class="form-label" for="fire-rate">Tỷ lệ rút tiền giả định (%/năm)</label><input class="form-input" id="fire-rate" type="number" min="1" max="10" step="0.1" required><label class="form-label" for="fire-notes">Ghi chú tài chính & điều cần cải thiện</label><textarea class="task-note-textarea" id="fire-notes"></textarea><button type="submit" class="btn-primary">Lưu thiết lập FIRE</button></form></dialog>
<dialog id="fitness-setup-modal" class="ielts-dialog" aria-labelledby="fitness-setup-modal-title">
<form onsubmit="App.applyFitnessSetup(event)">
<div class="ielts-modal-heading"><h2 id="fitness-setup-modal-title">Lịch tập & ăn uống của bạn</h2><button type="button" class="control-btn" aria-label="Đóng" onclick="document.getElementById('fitness-setup-modal').close()">✕</button></div>
<label class="form-label" for="gym-level">Kinh nghiệm tập luyện</label><select id="gym-level" class="form-select"><option value="Mới bắt đầu">Mới bắt đầu</option><option value="Đã tập dưới 6 tháng">Đã tập dưới 6 tháng</option><option value="Đã tập 6–12 tháng">Đã tập 6–12 tháng</option><option value="Đã tập trên 1 năm">Đã tập trên 1 năm</option><option value="Tập lại sau thời gian nghỉ">Tập lại sau thời gian nghỉ</option></select>
<label class="form-label" for="gym-goal">Mục tiêu</label><select id="gym-goal" class="form-select"><option value="Tăng cơ">Tăng cơ</option><option value="Giảm mỡ">Giảm mỡ</option><option value="Giữ dáng và tăng sức bền">Giữ dáng và tăng sức bền</option><option value="Tăng sức mạnh">Tăng sức mạnh</option></select>
<label class="form-label" for="gym-place">Nơi tập / thiết bị</label><select id="gym-place" class="form-select"><option value="Phòng gym đầy đủ thiết bị">Phòng gym đầy đủ thiết bị</option><option value="Tại nhà với tạ đơn / dây kháng lực">Tại nhà với tạ đơn / dây kháng lực</option><option value="Tại nhà không dụng cụ">Tại nhà không dụng cụ</option></select>
<label class="form-label" for="gym-minutes">Thời gian mỗi buổi</label><select id="gym-minutes" class="form-select"><option value="30">30 phút</option><option value="45">45 phút</option><option value="60">60 phút</option><option value="90">90 phút</option><option value="120">120 phút</option></select>
<label class="form-label" for="gym-days">Lịch tập</label><select id="gym-days" class="form-select"><option value="mon,wed,fri">Thứ 2, 4, 6</option><option value="mon,wed,fri,sun">Thứ 2, 4, 6 & Chủ nhật</option><option value="mon,tue,wed,thu,fri">Thứ 2 đến Thứ 6</option></select>
<label class="form-label" for="gym-calories">Calories đang nạp mỗi ngày (kcal, không bắt buộc)</label><input id="gym-calories" type="number" class="form-input" placeholder="Chưa biết thì để trống" min="1" step="1">
<label class="form-label" for="gym-target-calories">Mục tiêu calories đã có (kcal/ngày, không bắt buộc)</label><input id="gym-target-calories" type="number" class="form-input" placeholder="Để trống nếu chưa có mục tiêu" min="1" step="1">
<label class="form-label" for="gym-diet">Thói quen ăn uống</label><select id="gym-diet" class="form-select"><option value="Chưa theo dõi ăn uống">Chưa theo dõi ăn uống</option><option value="Ăn cơm nhà">Ăn cơm nhà</option><option value="Thường ăn ngoài">Thường ăn ngoài</option><option value="Ăn chay">Ăn chay</option><option value="Đang theo thực đơn riêng">Đang theo thực đơn riêng</option></select>
<label class="form-label" for="gym-meals">Số bữa mỗi ngày (không bắt buộc)</label><input id="gym-meals" type="text" class="form-input" placeholder="Ví dụ: 3 bữa chính + 1 bữa phụ">
<fieldset class="ielts-weak-options"><legend>Vùng muốn ưu tiên — Lưng</legend><label><input type="checkbox" name="gym-muscles" value="Mid back / lưng giữa"> Mid back / lưng giữa</label><label><input type="checkbox" name="gym-muscles" value="Lats / cơ xô"> Lats / cơ xô</label><label><input type="checkbox" name="gym-muscles" value="Teres major / cơ tròn lớn"> Teres major / cơ tròn lớn</label><label><input type="checkbox" name="gym-muscles" value="Rhomboids / cơ trám"> Rhomboids / cơ trám</label><label><input type="checkbox" name="gym-muscles" value="Lower traps / cầu vai dưới"> Lower traps / cầu vai dưới</label></fieldset><fieldset class="ielts-weak-options"><legend>Vùng muốn ưu tiên — Ngực</legend><label><input type="checkbox" name="gym-muscles" value="Ngực trên"> Ngực trên</label><label><input type="checkbox" name="gym-muscles" value="Ngực giữa / phần ức"> Ngực giữa / phần ức</label><label><input type="checkbox" name="gym-muscles" value="Toàn bộ ngực"> Toàn bộ ngực</label></fieldset><fieldset class="ielts-weak-options"><legend>Vùng muốn ưu tiên — Chân</legend><label><input type="checkbox" name="gym-muscles" value="Quads / đùi trước"> Quads / đùi trước</label><label><input type="checkbox" name="gym-muscles" value="Hamstrings / đùi sau"> Hamstrings / đùi sau</label><label><input type="checkbox" name="gym-muscles" value="Glutes / mông"> Glutes / mông</label><label><input type="checkbox" name="gym-muscles" value="Calves / bắp chân"> Calves / bắp chân</label></fieldset><p>Chọn các bài muốn đưa vào lịch; AI điều chỉnh theo kinh nghiệm và dụng cụ. Một bài thường huy động nhiều nhóm cơ, không cô lập hoàn toàn một vùng.</p><fieldset class="ielts-weak-options"><legend>Bài lưng</legend><label><input type="checkbox" name="gym-exercises" value="One-arm dumbbell row"> One-arm dumbbell row</label><label><input type="checkbox" name="gym-exercises" value="One-arm cable row"> One-arm cable row</label><label><input type="checkbox" name="gym-exercises" value="Chest-supported row"> Chest-supported row</label><label><input type="checkbox" name="gym-exercises" value="Lat pulldown"> Lat pulldown</label><label><input type="checkbox" name="gym-exercises" value="Straight-arm pulldown"> Straight-arm pulldown</label><label><input type="checkbox" name="gym-exercises" value="Reverse fly"> Reverse fly</label></fieldset><fieldset class="ielts-weak-options"><legend>Bài ngực</legend><label><input type="checkbox" name="gym-exercises" value="Incline dumbbell press"> Incline dumbbell press</label><label><input type="checkbox" name="gym-exercises" value="Flat dumbbell press"> Flat dumbbell press</label><label><input type="checkbox" name="gym-exercises" value="Cable fly"> Cable fly</label><label><input type="checkbox" name="gym-exercises" value="Push-up"> Push-up</label></fieldset><fieldset class="ielts-weak-options"><legend>Bài chân</legend><label><input type="checkbox" name="gym-exercises" value="Goblet squat"> Goblet squat</label><label><input type="checkbox" name="gym-exercises" value="Leg press"> Leg press</label><label><input type="checkbox" name="gym-exercises" value="Romanian deadlift"> Romanian deadlift</label><label><input type="checkbox" name="gym-exercises" value="Leg curl"> Leg curl</label><label><input type="checkbox" name="gym-exercises" value="Bulgarian split squat"> Bulgarian split squat</label><label><input type="checkbox" name="gym-exercises" value="Hip thrust"> Hip thrust</label><label><input type="checkbox" name="gym-exercises" value="Calf raise"> Calf raise</label></fieldset><h3>Ăn đủ đạm để phục hồi</h3><p>Protein cung cấp nguyên liệu sửa chữa và xây dựng cơ sau tập. Ăn đủ năng lượng, tập có tiến triển và nghỉ ngơi cũng cần thiết. NIH nêu khoảng tham khảo 1,2–2,0 g protein/kg/ngày cho vận động viên; đây không phải mục tiêu tự động cho mọi người. <a href="https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/" target="_blank" rel="noopener">Nguồn NIH</a>.</p>
<label class="form-label" for="gym-weight">Cân nặng (kg, tùy chọn)</label><input class="form-input" id="gym-weight" type="number" min="1" max="500" step="0.1">
<label class="form-label" for="gym-protein">Protein đang ăn (g/ngày, tùy chọn)</label><input class="form-input" id="gym-protein" type="number" min="0" max="1000" step="1">
<label class="form-label" for="gym-protein-target">Mục tiêu protein đã chọn (g/ngày, tùy chọn)</label><input class="form-input" id="gym-protein-target" type="number" min="1" max="1000" step="1">
<label class="form-label" for="gym-protein-foods">Nguồn đạm phù hợp</label><input class="form-input" id="gym-protein-foods" placeholder="Thịt, cá, trứng, sữa, đậu phụ, các loại đậu…">
<p>Kế hoạch sẽ có nhật ký hiệp × lần × mức tạ và protein thực tế từng ngày. <a href="https://www.acefitness.org/resources/everyone/exercise-library/" target="_blank" rel="noopener">Tham khảo kỹ thuật bài tập từ ACE</a>.</p><label class="form-label" for="gym-context">Thông tin thêm</label><input id="gym-context" type="text" class="form-input" placeholder="Cân nặng, thực phẩm cần tránh, ngân sách, giới hạn vận động…">

<button type="submit" class="btn-primary">Dùng thông tin này</button>
</form></dialog>
<dialog id="code-setup-modal" class="ielts-dialog" aria-labelledby="code-setup-modal-title">
<form onsubmit="App.applyCodeSetup(event)">
<div class="ielts-modal-heading"><h2 id="code-setup-modal-title">Bạn muốn xây gì với AI?</h2><button type="button" class="control-btn" aria-label="Đóng" onclick="document.getElementById('code-setup-modal').close()">✕</button></div>
<p>Một bước setup 15–20 phút để tạo chung <strong>ARCHITECTURE.md, PLAN.md, SPEC.md, DESIGN.md</strong>: chỉ cần khung ngắn gọn, cập nhật dần khi làm. Bạn tự chia sprint và thêm subtask.</p>
<label class="form-label" for="code-project-state">Bạn đang bắt đầu hay làm tiếp?</label>
<select id="code-project-state" class="form-select"><option>Dự án mới — setup một lần</option><option>Tiếp tục dự án hiện có — giữ lại tài liệu và tiến độ</option></select>
<label class="form-label" for="code-progress">Đã làm được gì & muốn hoàn thành gì tiếp theo?</label>
<textarea id="code-progress" class="task-note-textarea" placeholder="Tài liệu đã có, tính năng đã xong, việc đang vướng, mục tiêu nhỏ cho đợt tiếp theo…"></textarea>
<label class="form-label" for="code-platform">Nền tảng / công nghệ</label>
<select id="code-platform" class="form-select"><option>Chưa chọn — cần tư vấn theo dự án</option><option>Web tĩnh — HTML, CSS, JavaScript</option><option>Web app — JavaScript / TypeScript</option><option>Web PHP — PHP và MySQL / MariaDB</option><option>Python — ứng dụng, API hoặc tự động hóa</option><option>Ứng dụng AI — LM Studio, RAG</option><option>Mobile app</option><option>Desktop app</option><option>Khác — mô tả trong thông tin thêm</option></select>
<label class="form-label" for="code-deployment">Môi trường chạy / triển khai</label>
<select id="code-deployment" class="form-select"><option>Chưa chọn — cần hướng dẫn lựa chọn</option><option>Chạy local trên máy cá nhân</option><option>Shared hosting — cPanel / DirectAdmin</option><option>Static hosting</option><option>VPS / máy chủ riêng</option><option>Cloud / nền tảng quản lý ứng dụng</option><option>App store / bản cài đặt</option></select>
<label class="form-label" for="code-hosting-details">Hosting đang có & giới hạn (tùy chọn)</label>
<input id="code-hosting-details" class="form-input" placeholder="Nhà cung cấp, phiên bản PHP, database, SSH/Composer, dung lượng, ngân sách…">
<label class="form-label" for="code-level">Nền tảng hiện tại</label><select id="code-level" class="form-select"><option>Chưa biết lập trình — cần hướng dẫn từ đầu</option><option>Biết HTML/CSS/JavaScript cơ bản</option><option>Biết PHP và SQL cơ bản</option><option>Đã xây web app, muốn cải thiện quy trình</option><option value="Chưa biết lập trình">Chưa biết lập trình</option><option value="Đã dùng AI để viết code, chưa hiểu rõ nền tảng">Đã dùng AI để viết code, chưa hiểu rõ nền tảng</option><option value="Biết Python cơ bản">Biết Python cơ bản</option><option value="Đã làm dự án Python">Đã làm dự án Python</option><option value="Biết JavaScript, muốn học Python và AI">Biết JavaScript, muốn học Python và AI</option></select>
<fieldset class="ielts-weak-options"><legend>Chủ đề muốn học (chọn nhiều)</legend><label><input type="checkbox" name="code-topics" value="HTML, CSS, JavaScript & responsive web"> HTML, CSS, JavaScript & responsive web</label><label><input type="checkbox" name="code-topics" value="Web app frontend và backend"> Web app frontend và backend</label><label><input type="checkbox" name="code-topics" value="PHP, MySQL / MariaDB"> PHP, MySQL / MariaDB</label><label><input type="checkbox" name="code-topics" value="Deploy shared hosting, domain và HTTPS"> Deploy shared hosting, domain và HTTPS</label><label><input type="checkbox" name="code-topics" value="Python nền tảng"> Python nền tảng</label><label><input type="checkbox" name="code-topics" value="Khung dự án Python"> Khung dự án Python</label><label><input type="checkbox" name="code-topics" value="LM Studio / mô hình local"> LM Studio / mô hình local</label><label><input type="checkbox" name="code-topics" value="RAG / hỏi đáp tài liệu"> RAG / hỏi đáp tài liệu</label><label><input type="checkbox" name="code-topics" value="Embeddings & vector database"> Embeddings & vector database</label><label><input type="checkbox" name="code-topics" value="FastAPI / API backend"> FastAPI / API backend</label><label><input type="checkbox" name="code-topics" value="AI agents & tool calling"> AI agents & tool calling</label><label><input type="checkbox" name="code-topics" value="MCP"> MCP</label><label><input type="checkbox" name="code-topics" value="Đánh giá chất lượng AI (evals)"> Đánh giá chất lượng AI (evals)</label><label><input type="checkbox" name="code-topics" value="Khám phá công nghệ AI mới"> Khám phá công nghệ AI mới</label></fieldset>
<label class="form-label" for="code-core-idea">Ý tưởng chính của dự án (Core Project Idea / Concept)</label>
<textarea id="code-core-idea" class="task-note-textarea" rows="3" placeholder="Mô tả ý tưởng chính bạn muốn xây: Ứng dụng gì, giải quyết bài toán nào, tính năng cốt lõi là gì? Ví dụ: Web app AI Evals đánh giá & so sánh prompt/output giữa các mô hình AI, chạy tĩnh trên GitHub Pages."></textarea>
<label class="form-label" for="code-project">Dự án muốn xây</label><select id="code-project" class="form-select"><option>Web app quản lý công việc / dữ liệu</option><option>Website PHP với MySQL trên shared hosting</option><option>Website giới thiệu / portfolio / landing page</option><option value="Chatbot hỏi đáp tài liệu cá nhân bằng RAG">Chatbot hỏi đáp tài liệu cá nhân bằng RAG</option><option value="Trợ lý AI local với LM Studio">Trợ lý AI local với LM Studio</option><option value="API Python kết nối mô hình ngôn ngữ">API Python kết nối mô hình ngôn ngữ</option><option value="Công cụ tự động hóa công việc">Công cụ tự động hóa công việc</option><option value="Chưa rõ — muốn khám phá qua dự án nhỏ">Chưa rõ — muốn khám phá qua dự án nhỏ</option></select>
<label class="form-label" for="code-os">Máy đang dùng</label><select id="code-os" class="form-select"><option value="macOS">macOS</option><option value="Windows">Windows</option><option value="Linux">Linux</option></select>
<label class="form-label" for="code-hardware">Cấu hình máy (không bắt buộc)</label><input id="code-hardware" type="text" class="form-input" placeholder="Ví dụ: Apple Silicon, RAM 16 GB; hoặc GPU và VRAM">
<label class="form-label" for="code-minutes">Thời gian mỗi ngày</label><select id="code-minutes" class="form-select"><option value="30">30 phút</option><option value="45">45 phút</option><option value="60">60 phút</option><option value="90">90 phút</option><option value="120">120 phút</option></select>
<label class="form-label" for="code-process">Quy trình quản lý dự án</label>
<select id="code-process" class="form-select"><option>Agile / Scrum gọn cho cá nhân</option><option>Scrum cho nhóm</option><option>Kanban — dòng công việc liên tục</option><option>Chưa biết — muốn học quy trình từ đầu</option></select>
<label class="form-label" for="code-sprint">Chu kỳ làm việc</label>
<select id="code-sprint" class="form-select"><option>Tự chia sprint / chọn việc theo tiến độ</option><option>Sprint 1 tuần</option><option>Sprint 2 tuần</option><option>Theo luồng Kanban, không sprint cố định</option></select>
<fieldset class="ielts-weak-options"><legend>Thực hành & tiêu chuẩn muốn học</legend>
<label><input type="checkbox" name="code-standards" value="User stories & acceptance criteria"> User stories & acceptance criteria</label>
<label><input type="checkbox" name="code-standards" value="Definition of Done"> Definition of Done</label>
<label><input type="checkbox" name="code-standards" value="Git, pull request & code review"> Git, pull request & code review</label>
<label><input type="checkbox" name="code-standards" value="Kiểm thử tự động & CI/CD"> Kiểm thử tự động & CI/CD</label>
<label><input type="checkbox" name="code-standards" value="PEP 8, linting & type hints"> PEP 8, linting & type hints</label>
<label><input type="checkbox" name="code-standards" value="OWASP — bảo mật ứng dụng"> OWASP — bảo mật ứng dụng</label>
<label><input type="checkbox" name="code-standards" value="Quyền riêng tư & quản lý dữ liệu"> Quyền riêng tư & quản lý dữ liệu</label>
<label><input type="checkbox" name="code-standards" value="WCAG — khả năng truy cập"> WCAG — khả năng truy cập</label>
<label><input type="checkbox" name="code-standards" value="Tài liệu API / OpenAPI"> Tài liệu API / OpenAPI</label>
<label><input type="checkbox" name="code-standards" value="Giấy phép mã nguồn mở"> Giấy phép mã nguồn mở</label>
</fieldset>
<label class="form-label" for="code-context">Ý tưởng / điều muốn khám phá thêm</label><input id="code-context" type="text" class="form-input" placeholder="Dữ liệu muốn dùng, công cụ đang có, mục tiêu sản phẩm…">

<button type="submit" class="btn-primary">Dùng thông tin này</button>
</form></dialog>
<dialog id="ielts-level-modal" class="ielts-dialog" aria-labelledby="ielts-modal-title">
    <form onsubmit="App.applyIeltsLevel(event)">
        <div class="ielts-modal-heading">
            <h2 id="ielts-modal-title">Bạn đang ở đâu với IELTS?</h2>
            <button type="button" class="control-btn" aria-label="Đóng" onclick="document.getElementById('ielts-level-modal').close()">✕</button>
        </div>
        <p>Chọn gần đúng cũng được. AI sẽ dựa vào đây để lên lịch phù hợp.</p>
        <label class="form-label" for="ielts-test-type">Loại thi IELTS</label>
        <select id="ielts-test-type" class="form-select"><option value="unknown">Chưa rõ — cần xác định trước</option><option value="academic">Academic</option><option value="general">General Training</option></select>
        <p id="ielts-format-summary" class="ielts-format-help"></p>
        <label class="form-label" for="ielts-band">Trình độ / điểm hiện tại</label>
        <select id="ielts-band" class="form-select">
            <option>Chưa biết trình độ IELTS — cần bài đánh giá đầu vào</option>
            <option>Mới bắt đầu / chưa biết gì về IELTS</option>
            <option>IELTS 3.0</option>
            <option>IELTS 3.5</option>
            <option>IELTS 4.0</option>
            <option>IELTS 4.5</option>
            <option>IELTS 5.0</option>
            <option>IELTS 5.5</option>
            <option>IELTS 6.0</option>
            <option>IELTS 6.5</option>
            <option>IELTS 7.0</option>
            <option>IELTS 7.5</option>
            <option>IELTS 8.0</option>
            <option>IELTS 8.5</option>
            <option>IELTS 9.0</option>
        </select>
        <label class="form-label" for="ielts-target-band">Mục tiêu điểm IELTS (Target Band Score)</label>
        <select id="ielts-target-band" class="form-select">
            <option value="IELTS 6.5" selected>IELTS 6.5 (Mục tiêu phổ biến: Du học / Định cư)</option>
            <option value="IELTS 5.5">IELTS 5.5 (Cơ bản / Chuẩn đầu ra tốt nghiệp)</option>
            <option value="IELTS 6.0">IELTS 6.0 (Khá / Chuẩn đầu ra Đại học)</option>
            <option value="IELTS 7.0">IELTS 7.0 (Thành thạo / Nộp học bổng)</option>
            <option value="IELTS 7.5">IELTS 7.5 (Nâng cao / Công việc chuyên môn)</option>
            <option value="IELTS 8.0">IELTS 8.0 (Xuất sắc)</option>
            <option value="IELTS 8.5">IELTS 8.5 (Gần như bản xứ)</option>
            <option value="IELTS 9.0">IELTS 9.0 (Tuyệt đối)</option>
        </select>
        <label class="form-label" for="ielts-experience">Bạn đã ôn như thế nào?</label>
        <select id="ielts-experience" class="form-select">
            <option>Chưa từng ôn IELTS</option>
            <option>Đã tự ôn với ChatGPT</option>
            <option>Đã tự ôn với Gemini</option>
            <option>Đã ôn với cả ChatGPT và Gemini</option>
            <option>Đã tự học qua sách / video</option>
            <option>Đã học với giáo viên / trung tâm</option>
        </select>
        <fieldset class="ielts-weak-options">
            <legend>Kỹ năng còn yếu (có thể chọn nhiều)</legend>
            <label><input type="checkbox" name="ielts-weak" value="Listening"> Listening</label>
            <label><input type="checkbox" name="ielts-weak" value="Speaking"> Speaking</label>
            <label><input type="checkbox" name="ielts-weak" value="Reading"> Reading</label>
            <label><input type="checkbox" name="ielts-weak" value="Writing"> Writing</label>
            <label><input type="checkbox" name="ielts-weak" value="Vocabulary"> Vocabulary</label>
            <label><input type="checkbox" name="ielts-weak" value="Grammar"> Grammar</label>
        </fieldset>
        <label class="form-label" for="ielts-context">Thông tin thêm (không bắt buộc)</label>
        <textarea id="ielts-context" class="task-note-textarea" placeholder="Ví dụ: Điểm 4.5 là tự đánh giá, Speaking hay bí ý, chưa thi thật."></textarea>
        <h3>Dạng bài & khung luyện tập</h3>
        <p>Các dạng bài và chủ đề được chọn sẵn. Bỏ tick phần chưa muốn luyện; AI phân bổ theo trình độ và thời gian, không dồn tất cả vào một buổi. Các khung trả lời là gợi ý linh hoạt, không phải bài học thuộc lòng.</p>
        <div id="ielts-format-groups"></div>
        <details class="ielts-format-section"><summary>10 chủ đề luyện Writing Task 2</summary><p>Nhóm chủ đề để xây vốn ý, không phải dự đoán đề hoặc bảng xếp hạng tần suất.</p><div id="ielts-task2-topics" class="ielts-topic-grid"></div></details>
        <p class="ielts-format-help">Đối chiếu định dạng: <a href="https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test" target="_blank" rel="noopener">IELTS Academic</a> · <a href="https://ielts.org/take-a-test/preparation-resources/sample-test-questions/general-training-test" target="_blank" rel="noopener">General Training</a>. Năm nhóm Task 2 dùng để luyện tập; đề thực tế có thể kết hợp yêu cầu.</p>
        <button type="submit" class="btn-primary">Dùng thông tin này</button>
    </form>
</dialog>

<!-- 6. Plan Selector & Notes Modal Dialog (Modal Con Mắt) -->
<dialog id="plan-modal" class="ielts-dialog" aria-labelledby="plan-modal-title">
    <div class="ielts-modal-heading">
        <div style="display:flex; align-items:center; gap:0.5rem;">
            <span data-icon="eye" aria-hidden="true"></span>
            <h2 id="plan-modal-title">Kế hoạch của bạn (Plans)</h2>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
            <button type="button" class="btn-sample" id="btn-modal-create-plan" onclick="App.createPlanFromModal()">
                <span data-icon="spark" aria-hidden="true"></span> <span>+ Tạo plan</span>
            </button>
            <button type="button" class="control-btn" aria-label="Đóng" onclick="document.getElementById('plan-modal').close()">✕</button>
        </div>
    </div>

    <p style="font-size:0.85rem; color:var(--ink-secondary); margin:0.5rem 0 1rem; line-height:1.45;">
        Mỗi lần chỉ hiển thị 1 kế hoạch để tập trung tối đa. Chọn kế hoạch bên dưới để xem hoặc bấm <strong>+ Tạo plan</strong> để thêm kế hoạch mới.
    </p>

    <!-- Plan Slots List -->
    <div id="modal-plans-list" class="modal-plans-grid"></div>

    <!-- Notes & Visibility preferences -->
    <details class="modal-notes-details" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; background: var(--bg-hover);">
        <summary style="font-weight:600; cursor:pointer; font-size:0.85rem; user-select:none;">
            Ghi chú & Tùy chọn hiển thị
        </summary>
        <div class="notes-visibility-control" style="margin: 0.75rem 0 0.5rem; padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-page);">
            <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:600; font-size:0.85rem;">
                <span style="display:flex; align-items:center; gap:0.5rem;">
                    <span data-icon="book" aria-hidden="true"></span>
                    <span>Hiển thị ghi chú trong danh sách bài tập (Task Notes)</span>
                </span>
                <input type="checkbox" id="toggle-notes-visibility" style="width:1.2rem; height:1.2rem; cursor:pointer;" onchange="App.toggleNotesVisibility(this.checked)">
            </label>
        </div>
        <div class="modal-notes-section" style="margin-top:0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <strong style="font-size:0.85rem;">Ghi chú của kế hoạch đang mở</strong>
                <span id="modal-notes-count" style="font-size:0.75rem; color:var(--ink-secondary);"></span>
                <button type="button" class="btn-sample" id="btn-modal-add-note" style="padding:0.15rem 0.5rem; font-size:0.75rem;" onclick="App.addQuickNote()">+ Thêm ghi chú</button>
            </div>
            <div id="modal-notes-container"></div>
        </div>
    </details>
</dialog>

<!-- 7. Professional Global Confirmation Modal Dialog -->
<dialog id="app-confirm-dialog" class="ielts-dialog confirm-modal-dialog" aria-labelledby="confirm-modal-title">
    <div class="confirm-modal-content">
        <div class="confirm-modal-icon-badge" id="confirm-modal-icon-badge">
            <span data-icon="alert" aria-hidden="true"></span>
        </div>
        <div class="confirm-modal-body">
            <h3 id="confirm-modal-title" class="confirm-modal-title">Xác nhận</h3>
            <p id="confirm-modal-desc" class="confirm-modal-desc">Bạn có chắc chắn muốn thực hiện hành động này?</p>
        </div>
        <div class="confirm-modal-actions">
            <button type="button" class="btn-sample btn-confirm-cancel" id="btn-confirm-cancel">Hủy</button>
            <button type="button" class="btn-danger-confirm" id="btn-confirm-ok">Xóa</button>
        </div>
    </div>
</dialog>

<div id="password-modal" class="modal-backdrop" style="display:none;">
    <div class="modal-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--ink-primary); font-family:var(--font-sans);">
                Cài đặt Kế hoạch & Bảo mật
            </h3>
            <button class="control-btn" onclick="App.closePasswordModal()">✕</button>
        </div>
        <form id="password-settings-form" onsubmit="App.submitPasswordSettings(event)">
            <!-- Phần 1: Thời gian tự động xóa -->
            <div style="margin-bottom:1.25rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color, #e0e0e0);">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.35rem; font-family:var(--font-sans);">
                    ⏱ Thời gian tự động xóa plan (Auto-delete):
                </label>
                <select id="modal-auto-delete" class="form-select">
                    <option value="90" selected>Sau 90 ngày (Mặc định)</option>
                    <option value="0">Không bao giờ (Giữ vĩnh viễn)</option>
                    <option value="1">Sau 24 giờ (1 ngày)</option>
                    <option value="7">Sau 7 ngày</option>
                    <option value="30">Sau 30 ngày</option>
                </select>
                <div style="font-size:0.75rem; color:var(--ink-secondary); margin-top:0.25rem;">
                    Sau khoảng thời gian này, kế hoạch sẽ tự động được dọn dẹp để bảo vệ quyền riêng tư.
                </div>
            </div>

            <!-- Phần 2: Mật khẩu bảo vệ -->
            <div style="margin-bottom:1rem;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem; font-family:var(--font-sans);">
                    Mật khẩu bảo vệ (Tùy chọn):
                </label>
                <div style="font-size:0.75rem; color:var(--ink-secondary); margin-bottom:0.75rem;">
                    Để trống các ô mật khẩu nếu bạn chỉ muốn thay đổi thời gian tự động xóa hoặc giữ nguyên mật khẩu cũ.
                </div>

                <div id="field-current-password" style="margin-bottom:0.75rem; display:none;">
                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem; font-family:var(--font-sans);">Mật khẩu hiện tại:</label>
                    <input type="password" id="modal-current-password" class="input-passcode" placeholder="Nhập mật khẩu hiện tại...">
                </div>

                <div id="field-new-password" style="margin-bottom:0.75rem;">
                    <label id="label-new-password" style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem; font-family:var(--font-sans);">Mật khẩu mới:</label>
                    <input type="password" id="modal-new-password" class="input-passcode" placeholder="Nhập mật khẩu mới (hoặc để trống nếu không đổi)...">
                </div>

                <div id="field-remove-password" style="margin-bottom:0.5rem; display:none;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; font-size:0.8rem; cursor:pointer; color:var(--ink-secondary);">
                        <input type="checkbox" id="modal-remove-password" onchange="App.onToggleRemovePassword(this)">
                        <span>Gỡ bỏ mật khẩu bảo vệ (Không yêu cầu mật khẩu khi truy cập)</span>
                    </label>
                </div>
            </div>

            <div id="modal-password-msg" class="unlock-error-msg" style="display:none;"></div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.25rem;">
                <button type="button" class="btn-timer btn-timer-secondary" onclick="App.closePasswordModal()">Hủy</button>
                <button type="submit" class="btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    </div>
</div>

<script src="assets/js/i18n.js?v=<?php echo filemtime(__DIR__ . '/assets/js/i18n.js'); ?>"></script>
<script src="assets/js/workspace.js?v=<?php echo filemtime(__DIR__ . '/assets/js/workspace.js'); ?>"></script>
<script src="assets/js/ielts.js?v=<?php echo filemtime(__DIR__ . '/assets/js/ielts.js'); ?>"></script>
<script src="assets/js/icons.js?v=<?php echo filemtime(__DIR__ . '/assets/js/icons.js'); ?>"></script>
<script src="assets/js/journal.js?v=<?php echo filemtime(__DIR__ . '/assets/js/journal.js'); ?>"></script>
<script src="assets/js/finance.js?v=<?php echo filemtime(__DIR__ . '/assets/js/finance.js'); ?>"></script>
<script src="assets/js/app.js?v=<?php echo filemtime(__DIR__ . '/assets/js/app.js'); ?>"></script>
</body>
</html>
