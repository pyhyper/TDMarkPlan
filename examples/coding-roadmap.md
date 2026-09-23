---
plan_id: fullstack-dev-roadmap
domain: vibecode
title: Vibe Code — Đợt làm việc 1 tuần
version: 1.0
timezone: Asia/Ho_Chi_Minh
goal:
  type: general
  description: Hoàn thành một lát cắt nhỏ của ứng dụng, rồi chọn việc cho đợt tiếp theo.
schedule:
  days: [mon, tue, wed, thu, fri]
  daily_minutes: 30
start_date: 2026-09-28
duration_weeks: 1
---
# Goal
## Objective
Xây một phiên bản nhỏ có thể chạy và kiểm tra. Người dùng tự chia sprint, cập nhật phạm vi theo tiến độ.
## Current Level
Điều chỉnh theo nền tảng và mã nguồn hiện có.
## Target
Một luồng sử dụng đơn giản chạy được, kèm tài liệu đủ để tiếp tục.
# Week 1
## Monday
- [ ] Setup chung ARCHITECTURE.md, PLAN.md, SPEC.md và DESIGN.md
  - id: dev-setup
  - type: coding
  - duration: 20
  - priority: high
  - description: "Tạo một lần khung bốn file: ARCHITECTURE.md ghi stack, thành phần, dữ liệu và hosting; PLAN.md ghi MVP, backlog và đợt làm tiếp; SPEC.md ghi yêu cầu, tiêu chí nghiệm thu; DESIGN.md ghi luồng, màn hình/API và trạng thái lỗi. Mỗi file vài gạch đầu dòng, cập nhật dần. Nếu tiếp tục dự án thì rà soát và bổ sung tài liệu hiện có, không tạo lại. PLAN.md này thuộc repository, khác với lịch trên web. Không cần chia thành bốn task."
## Tuesday
- [ ] Chạy được khung dự án trên máy
  - id: dev-local
  - type: coding
  - duration: 30
  - priority: high
  - description: "Chọn cách chạy đúng stack/hosting trong ARCHITECTURE.md. Tạo trang hoặc lệnh chào đơn giản; ghi lệnh chạy vào tài liệu. Dự án có sẵn thì xác nhận chạy được bản hiện tại, giữ nguyên công việc đã hoàn thành."
## Wednesday
- [ ] Hoàn thành một luồng sử dụng nhỏ
  - id: dev-slice
  - type: coding
  - duration: 30
  - priority: high
  - description: "Tự chọn một việc nhỏ trong backlog, ví dụ form nhập và hiển thị một ghi chú. Giới hạn phạm vi để kiểm tra được trong buổi này; phần còn lại để đợt sau."
## Thursday
- [ ] Kiểm tra một trường hợp đúng và một trường hợp lỗi
  - id: dev-check
  - type: review
  - duration: 20
  - priority: medium
  - description: "Dùng tiêu chí trong SPEC.md để kiểm tra luồng vừa làm, ghi kết quả và sửa một lỗi nhỏ nếu có. Cập nhật tài liệu nếu hành vi thay đổi."
## Friday
- [ ] Tổng kết ngắn và chọn việc làm tiếp
  - id: dev-next
  - type: review
  - duration: 15
  - priority: medium
  - description: "Ghi đầu ra đã chạy được, việc còn vướng và một mục tiêu tiếp theo. Tự chia sprint mới nếu muốn, hoặc xuất nhật ký nhờ AI điều chỉnh; không bắt buộc lập kế hoạch dài."
