# Bộ nhớ chung – English Ko Khó

Ai làm gì cũng ghi vào đây, kể cả Claude Code. Đọc file này đầu mỗi phiên làm việc. File sống trên `master`: sửa xong thì commit (`Content: …` hoặc `Publish: …`) và push ngay để người khác pull về là thấy.

- Tiến độ từng chủ đề: `python scripts/status.py --fetch`. Script đọc `tracking/topics.csv` và các nhánh `episode/*`, đừng chép bảng tiến độ vào đây.
- Kế hoạch và luật đan xen: `documents/Experiment_30.md`
- Số liệu: `tracking/metrics.csv` → `python scripts/report.py`

## Đang ở đâu

Chuẩn bị thử nghiệm 30 ngày, chưa đăng tập nào. Mới có `001-spect` (nháp, chờ kiểm chứng). Template mới dựng được dạng Gốc từ.

## Việc tiếp theo

Nhận việc bằng cách ghi tên vào `[ ]`, ví dụ `[ ] (DanNK) …`. Xong thì đánh `[x]` và ghi một dòng vào Nhật ký.

- [ ] Kiểm chứng 8 từ của `001-spect` (Etymonline + Cambridge), đặt `verified: true`, rồi dựng bản cuối
- [ ] **Chặn 15 slot chẵn:** làm template (và nới schema nếu cần) cho `surprising_origin`, `sino_vietnamese`, `confusing_pair`, `guess_challenge`. Nên làm trước 2 dạng đầu, vì slot 2 và 4 cần trước
- [ ] Soạn slot 2–7 (nhận trong `topics.csv` trước khi làm)
- [ ] Có ít nhất 3 tập `rendered` (tốt nhất 5–7) trước khi đăng ngày 1
- [ ] Chọn giờ đăng cố định trong khung 19:00–21:00, ghi vào Quyết định
- [ ] Mở thử YouTube Studio và TikTok Studio, xem có đủ các số ở `Experiment_30.md` mục 5 không. Thiếu thì sửa lại tài liệu
- [ ] Sau slot 15: đánh giá giữa kỳ (`Experiment_30.md` mục 7)

## Quyết định

Mới nhất ở trên. Ghi ngày, ai quyết, quyết gì, vì sao.

- **2026-10-24** (DanNK): Thử nghiệm 30 ngày, mỗi ngày 1 video. Slot lẻ là Gốc từ, slot chẵn xoay 4 dạng khác. Người phụ trách tự chọn ngày đăng, kế hoạch chỉ quy định thứ tự. Bộ nhớ chung và số liệu để trong repo trên `master`.
- **2026-10-24** (DanNK): Bỏ tập gốc -LOG- của lộ trình cũ, vì tập Hán Việt slot 4 (bio/geo/-logy) đã dạy phần này.

## Nhật ký

Mới nhất ở trên. Dạng: `- YYYY-MM-DD (ai): làm gì — kết quả / lưu ý`.

- 2026-10-24 (Claude): Tạo bộ nhớ chung (`tracking/`), danh sách 30 chủ đề, `scripts/status.py`, `scripts/report.py` và `documents/Experiment_30.md`.

## Bài học

Những gì rút ra được và nên giữ cho các tập sau (hook nào ăn, lỗi giọng đọc hay gặp, mẹo dựng nhanh…).

- (chưa có)
