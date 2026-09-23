# 📖 TDMarkPlan — Markdown TodoList & Life Planner

> **Một ứng dụng thực thi kế hoạch & quản lý công việc (TodoList) định dạng Markdown, mang phong cách máy đọc sách E-Reader (Kindle Paperwhite & Kobo Color Reader).**  
> Thiết kế thuần **PHP 7.4+ & Vanilla HTML/CSS/JS** — Tối giản, không phụ thuộc thư viện nặng, chạy mượt mà trên mọi Shared Hosting (cPanel, DirectAdmin) và môi trường cục bộ.

[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B%20%7C%208.x-777BB4?style=flat-square&logo=php&logoColor=white)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla)-success?style=flat-square)](#)
[![Hosting Ready](https://img.shields.io/badge/Deploy-Shared%20Hosting%20Ready-blue?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#)

---

## 💡 Triết lý thiết kế: Tại sao lại là TDMarkPlan?

Chúng ta đang sống trong kỷ nguyên của các công cụ quản lý công việc phức tạp: **Notion** mất cả buổi để chỉnh template, **TickTick/Todoist** nhiều tính năng thừa thãi và thu phí hàng tháng, **Obsidian** cần cài hàng tá plugin.

Nhưng khi bạn nhờ **ChatGPT, Claude hay Gemini** lập một lộ trình học IELTS, học lập trình hay kế hoạch thể hình, AI luôn trả về một file **Markdown (`PLAN.md`)**. Sau đó thì sao? Hầu hết chúng ta copy vào note rồi… **bỏ quên nó**.

**TDMarkPlan** ra đời để giải quyết triệt để vấn đề này:
1. **Markdown-First & AI-Native**: Nhận trực tiếp file `PLAN.md` từ ChatGPT/Claude/Gemini, tự động phân tích thành lộ trình từng tuần, từng ngày và từng checklist nhiệm vụ.
2. **Giao diện E-Reader "chữa lành"**: Mang trải nghiệm máy đọc sách E-Ink (Kindle & Kobo Color) vào web — nền giấy ấm dịu mắt, font chữ sách sắc nét, không thông báo làm xao nhãng.
3. **Mỗi ngày chỉ cần biết: "Hôm nay làm gì?"**: Tự động lọc ra đúng nhiệm vụ của ngày hôm nay, tích hợp **Focus Timer** (Pomodoro) để bấm giờ tập trung.
4. **Vòng lặp AI Adaptation**: Làm xong tick chọn `- [x]`, ghi chú bài học, rồi xuất ngược lại Markdown ném cho AI: *"Đây là tiến độ tuần qua của tôi, hãy tối ưu hóa tuần tiếp theo!"*.
5. **Zero Dependency & Tự chủ dữ liệu**: 100% PHP thuần, không cần cơ sở dữ liệu MySQL, không Laravel, không Node.js build. Quăng lên hosting 20k/tháng là chạy vĩnh viễn!

---

## ✨ Các tính năng nổi bật

### 1. Trình đọc E-Reader đa sắc thái (Kindle Paperwhite & Kobo Color)
- 📜 **Màu giấy (Warm Paper)**: Nền giấy vàng kem dịu mắt (`#FAF8F1`), font chữ Literata chuẩn sách in. Highlight đơn sắc đen/trắng tương phản cao.
- 🌙 **Màu đen (Dark E-Ink)**: Nền đen sâu (`#121212`) chống mỏi mắt tuyệt đối khi học tập ban đêm.
- 🎨 **Màu đa sắc (Kobo Color)**: 6 màu bút vẽ và highlight chuẩn máy đọc sách màu:
  - 🟡 **Vàng (Butter Yellow)**
  - 🔵 **Xanh lơ (Dusk Blue)**
  - 🌸 **Hồng (Candy Pink)**
  - 🟢 **Xanh lá (Misty Green)**
  - 🔴 **Đỏ (Cayenne Red)**
  - ⚫ **Bút đen (Black Pen)**
- **Visual Live Highlighter**: Bôi đen chữ rồi chọn màu — văn bản hiển thị màu nền highlight trực tiếp ngay trên trang (không bị lộ mã HTML thô), có nút **✕ Bỏ màu**.
- Tùy chỉnh cỡ chữ linh hoạt (`A-` / `A+`) và hiển thị toàn màn hình (full-width) thoáng đãng.

### 2. Quản lý TodoList & Nhiệm vụ hàng ngày
- **Chế độ "Hôm nay"**: Hiển thị chính xác các việc cần làm trong ngày với thời gian dự kiến (phút).
- **Subtasks (Checklist việc nhỏ)**: Chia nhỏ task chính thành các bước hành động cụ thể, tick hoàn thành ngay khi làm xong.
- **Icon Xóa & Confirm Modal chuyên nghiệp**: Xóa task, xóa subtask hay xóa plan đều có hộp thoại xác nhận thanh lịch, không dùng popup thô của trình duyệt.
- **Đổi tên Task trực tiếp (Rename Task)**: Nút bút chì cạnh tiêu đề task cho phép chỉnh sửa tên nhanh chóng.
- **Trạng thái linh hoạt**: `Chưa làm`, `Đang làm`, `Hoàn thành`, `Bỏ qua`, `Thất bại`.

### 3. Focus Session Timer (Đồng hồ tập trung)
- Đếm ngược thời gian thực thi task theo chuẩn Pomodoro.
- Hỗ trợ tạm dừng, tiếp tục, kết thúc sớm.
- Chuông âm thanh nhẹ nhàng (Web Audio API) khi hoàn thành phiên tập trung mà không cần tải thêm file mp3 bên ngoài.

### 4. Hệ thống 2 Plan song song trong 1 Link (Single Focus Deck)
- Mỗi đường link cá nhân có thể chứa tối đa 2 kế hoạch song song (ví dụ: *Plan 1: Luyện thi IELTS* và *Plan 2: Vibe Code dự án Web*).
- **Quy tắc Tập trung tuyệt đối**: Trên màn hình chính luôn chỉ hiển thị duy nhất **1 plan** tại một thời điểm để tránh quá tải nhận thức.
- **Modal quản lý trực quan (Icon con mắt)**: Bấm vào icon con mắt ở thanh điều hướng để mở danh sách card plan.
- **Clickable Card**: Nhấp vào bất kỳ thẻ card nào để kích hoạt và hiển thị ngay kế hoạch đó ra màn hình chính.

### 5. Thiết lập chuyên sâu 5 lĩnh vực
- 🎓 **IELTS & Ngoại ngữ**: Chọn điểm mục tiêu (Band 5.5 đến 9.0), khảo sát trình độ hiện tại, 10 chủ đề Task 2 mẫu, tự động tạo prompt chuẩn hóa gửi cho AI.
- 💻 **Vibe Code & AI Builder**: Định hình loại dự án (Web tĩnh, Chrome Extension, CLI, Backend), nhập ý tưởng cốt lõi (Core Idea), sinh cấu trúc tài liệu `ARCHITECTURE.md` + `PLAN.md`.
- 🏃 **Thể hình & Thói quen (Fitness)**: Chia buổi tập, bài tập, hiệp tập và thời gian phục hồi.
- 💰 **Tài chính tự do (FIRE & Finance)**: Bảng tính tài sản ròng, theo dõi chi tiêu, tính tỷ lệ rút an toàn (Safe Withdrawal Rate - SWR) và phân tích dòng tiền.
- 📝 **Sổ ghi chú tự do (Freeform Notebook)**: Tạo nhanh sổ tay ghi chú độc lập, hỗ trợ tính năng **Tự động xóa sau N ngày** (Auto-delete) để dọn dẹp ghi chú tạm.

### 6. Link cá nhân động & Mã PIN bảo mật
- **Dynamic Link**: Mỗi kế hoạch gắn liền với 1 đường link riêng biệt (ví dụ: `yourdomain.com/ielts-7-0-sprint`).
- **Đổi tên link tùy biến (Custom Link)**: Tự do đổi sang slug ngắn gọn, dễ nhớ.
- **Bảo mật bằng mã PIN / Passcode**: Khóa link bằng mã PIN cá nhân. Khi người lạ mở link sẽ thấy màn hình khóa phong cách E-Reader; chỉ người có mã PIN mới xem và chỉnh sửa được.

---

## 🚀 Hướng dẫn cài đặt & Triển khai

### Cách 1: Chạy cục bộ (Local Development)
Chỉ cần máy tính có cài sẵn PHP (7.4 trở lên), không cần cài thêm bất cứ phần mềm hay database nào:

```bash
# 1. Clone repository hoặc giải nén thư mục
cd TDP

# 2. Khởi chạy server PHP tích hợp
php -S 127.0.0.1:8088 router.php

# 3. Mở trình duyệt và truy cập:
# http://127.0.0.1:8088/
```

### Cách 2: Triển khai lên Shared Hosting (cPanel / DirectAdmin)
1. Nén toàn bộ mã nguồn thư mục dự án thành file `.zip`.
2. Đăng nhập vào cPanel / DirectAdmin -> Mở **File Manager**.
3. Tải file `.zip` lên thư mục `public_html` (hoặc thư mục subdomain của bạn) và **Extract** (giải nén).
4. Đảm bảo thư mục `data/` có quyền ghi (`chmod 755` hoặc `775`).
5. Truy cập tên miền của bạn (ví dụ: `https://myplans.domain.com`) — Ứng dụng hoạt động ngay lập tức!

---

## 📁 Cấu trúc thư mục dự án

```text
TDP/
├── index.php             # Giao diện chính E-Reader & Controller HTML/PHP
├── api.php               # RESTful API xử lý CRUD plan, tasks, notes, PIN
├── config.php            # Cấu hình đường dẫn, thời gian hết hạn, bảo mật
├── router.php            # Router cho PHP built-in server cục bộ
├── .htaccess             # Cấu hình Apache, bảo vệ thư mục data/, nén gzip
│
├── lib/                  # Các module xử lý logic PHP thuần
│   ├── PlanParser.php    # Phân tích YAML frontmatter & cú pháp Markdown
│   ├── PlanValidator.php # Bộ quy tắc kiểm tra tính hợp lệ của kế hoạch
│   ├── PlanStorage.php   # Quản lý lưu trữ file JSON, mã PIN, link động, token
│   └── AiAdapter.php     # Bộ sinh prompt AI thích ứng (vòng lặp phản hồi)
│
├── assets/
│   ├── css/
│   │   └── ereader.css   # Toàn bộ CSS phong cách Kindle & Kobo Color Reader
│   └── js/
│       ├── app.js        # Controller chính, xử lý giao diện, timer, modal
│       ├── workspace.js  # Quản lý 2 plan song song trong link
│       ├── journal.js    # Visual Live Highlight Editor & ghi chú
│       ├── icons.js      # Bộ icon SVG thủ công tối giản siêu nhẹ
│       ├── ielts.js      # Logic trắc nghiệm và sinh prompt IELTS
│       ├── vibecode.js   # Logic định hình dự án Vibe Code & AI
│       └── finance.js    # Logic tính toán tài chính & tự do FIRE
│
├── examples/             # Các kế hoạch mẫu định dạng PLAN.md
│   ├── ielts-6.5.md      # Lộ trình IELTS 6.5 chuẩn (12 tuần)
│   ├── coding-roadmap.md # Lộ trình Full-Stack Web (8 tuần)
│   └── fitness-5k.md     # Kế hoạch chạy bộ Couch to 5K (6 tuần)
│
├── tests/                # Bộ kiểm thử tự động toàn diện
│   ├── test_parser.php   # Unit test PHP parser, validator, storage (34 tests)
│   ├── test_roundtrip.php# Test xuất & nhập vòng lặp Markdown (20 tests)
│   ├── test_theme_highlight.js # Test theme, highlight, confirm dialog, modal
│   ├── test_ielts.js     # Test sinh prompt IELTS với target band
│   ├── test_vibecode.js  # Test sinh prompt Vibe Code với core idea
│   └── test_workspace_api.py # Integration test API slot 1 & slot 2 (17 tests)
│
└── data/                 # Thư mục lưu trữ dữ liệu an toàn (được bảo vệ)
    └── plans/            # Chứa các file JSON kế hoạch và execution state
```

---

## 📝 Định dạng chuẩn file `PLAN.md`

Bạn có thể yêu cầu ChatGPT, Claude hoặc Gemini xuất kế hoạch theo chuẩn cú pháp sau:

````markdown
---
plan_id: ielts-7-sprint
title: Lộ trình tăng tốc IELTS 7.0
duration_weeks: 4
start_date: 2026-10-01
domain: ielts
---

# Lộ trình tăng tốc IELTS 7.0

## Tuần 1: Nền tảng Writing Task 2 & Focus Listening

### 2026-10-01
- [ ] Task 1: Phân tích 3 bài mẫu Band 8 dạng Opinion essay (90 min) [id: w1-d1-t1]
- [ ] Task 2: Nghe và chép chính tả Cambridge 18 Test 1 Section 3 (45 min) [id: w1-d1-t2]

### 2026-10-02
- [ ] Task 1: Luyện viết 2 mở bài + 2 kết bài theo chủ đề Education (60 min) [id: w1-d2-t1]
- [ ] Task 2: Học 15 cụm Collocations chủ đề Education & Work (30 min) [id: w1-d2-t2]
````

---

## 🤖 Prompt mẫu gửi ChatGPT / Claude / Gemini

Dán đoạn prompt này vào khung chat với AI:

```text
Hãy đóng vai chuyên gia lập kế hoạch cá nhân. Tôi muốn lập một kế hoạch chi tiết cho mục tiêu: "[Nhập mục tiêu của bạn ở đây, ví dụ: Luyện thi IELTS từ 6.0 lên 7.0 trong 8 tuần]".

Hãy xuất kế hoạch duy nhất dưới dạng 1 khối mã Markdown (```markdown ... ```) tuân thủ chính xác định dạng sau:
1. Có YAML frontmatter ở đầu: plan_id, title, duration_weeks, start_date (YYYY-MM-DD), domain.
2. Tiêu đề H1 cho tên kế hoạch.
3. Mỗi tuần bắt đầu bằng H2 (## Tuần X: Tên trọng tâm tuần).
4. Mỗi ngày trong tuần bắt đầu bằng H3 (### YYYY-MM-DD).
5. Các nhiệm vụ viết dạng Markdown checklist: - [ ] Task name (X min) [id: wX-dY-tZ]
6. Không thêm lời mở đầu hay kết luận ngoài khối mã markdown để tôi có thể sao chép và nhập thẳng vào ứng dụng TDMarkPlan.
```

---

## 🛡️ Bản quyền & Đóng góp

- Dự án được phát triển dưới giấy phép mã nguồn mở **MIT License**.
- Đóng góp mã nguồn (Pull Requests) và báo lỗi (Issues) luôn được hoan nghênh nồng nhiệt!
