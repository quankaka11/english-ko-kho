# Thử nghiệm 30 ngày: mỗi ngày một video, đan xen dạng tập

Oct 24, 2026 · @DanNK

Tài liệu này thay mục 7 (lịch 3 tập/tuần) của `Content_Plan.md` trong thời gian thử nghiệm. Danh sách chủ đề nằm ở `tracking/topics.csv`, tiến độ và ghi chú chung ở `tracking/NOTES.md`, số liệu ở `tracking/metrics.csv`.

## 1. Thử nghiệm để trả lời câu hỏi gì

1. **Dạng tập nào giữ chân và kéo theo dõi tốt nhất?** So 5 dạng: Gốc từ, Nguồn gốc bất ngờ, Hán Việt, Cặp dễ nhầm, Thử thách đoán.
2. **Đăng mỗi ngày có làm kịp không** mà vẫn giữ được bước kiểm chứng 2 nguồn?
3. **TikTok hay YouTube Shorts** hợp với kênh hơn?

Ngày đăng do người phụ trách tự chọn. Kế hoạch chỉ quy định **thứ tự** 30 slot. Nghỉ một ngày thì hôm sau đăng tiếp slot kế tiếp và ghi lại lý do nghỉ trong `NOTES.md`.

## 2. Quy tắc đan xen

- **Slot lẻ là Gốc từ** (15 tập), là xương sống của kênh. Các gốc được xếp xen Latin, Hy Lạp, tiền tố và hậu tố.
- **Slot chẵn là dạng khác**, xoay vòng theo thứ tự: Nguồn gốc bất ngờ → Hán Việt → Cặp dễ nhầm → Thử thách đoán.

| Dạng (`format`) | Số tập | Slot | Vì sao thử |
| --- | --- | --- | --- |
| `root_family` Gốc từ | 15 | 1, 3, 5 … 29 | Giá trị cốt lõi: 1 gốc, 6–8 từ |
| `surprising_origin` Nguồn gốc bất ngờ | 4 | 2, 10, 18, 26 | Hook tò mò mạnh, dễ được chia sẻ |
| `sino_vietnamese` Hán Việt | 4 | 4, 12, 20, 28 | Điểm khác biệt mà kênh nước ngoài không làm được |
| `confusing_pair` Cặp dễ nhầm | 4 | 6, 14, 22, 30 | Hữu ích cho người ôn IELTS/TOEIC, dễ được lưu |
| `guess_challenge` Thử thách đoán | 3 | 8, 16, 24 | Ôn các gốc đã học, kéo bình luận. Nên có giọng hoặc mặt thật để tránh bị YouTube coi là "theo khuôn" |

Mỗi dạng khác có 3–4 tập, vừa đủ để thấy xu hướng. Các dạng xuất hiện rải đều suốt 30 ngày, nên kênh lớn dần theo thời gian không làm lệch phép so sánh.

Có thể đổi chỗ hoặc thay chủ đề, nhưng phải giữ 2 luật: **không có 2 tập Gốc từ liền nhau**, và **không có 2 tập cùng dạng khác liền nhau**. `python scripts/status.py` sẽ cảnh báo khi vi phạm.

## 3. Giữ cố định để so sánh công bằng

Chỉ để **dạng tập** thay đổi. Những thứ sau giữ nguyên suốt 30 ngày:

- **Giờ đăng:** chọn một giờ trong khung 19:00–21:00 (ví dụ 20:00) và đăng đúng giờ đó mọi ngày, trên cả hai nền tảng.
- **File đăng:** cùng một file mp4 cho TikTok và Shorts, đăng cùng ngày.
- **Khuôn caption, hashtag, intro/outro, nhạc:** giữ như `post.md` sinh ra.
- **Không xoá hay ẩn video kém:** số liệu xấu cũng là dữ liệu.

Sửa template giữa chừng (ví dụ đổi hook) thì ghi vào `NOTES.md` → Quyết định, kèm slot bắt đầu áp dụng.

## 4. Nhịp sản xuất

- **Trước ngày 1:** có ít nhất 3 tập đã dựng (status `rendered`), tốt nhất là 5–7. `status.py` báo số tập trong vùng đệm.
- **Việc cần làm trước:** template hiện mới dựng được dạng Gốc từ. 15 slot chẵn cần template cho 4 dạng còn lại; schema `episode.json` có thể cũng phải nới cho các dạng này. Đây là việc chặn lớn nhất, đã có trong `NOTES.md` → Việc tiếp theo.
- **Làm theo lô:** mỗi buổi soạn 3–4 tập, lần lượt từng tập một: soạn, kiểm chứng, dựng.
- **Hết vùng đệm thì nghỉ một ngày chứ không bỏ qua kiểm chứng.** Không bao giờ đăng tập có từ `verified: false`.
- **Nhận việc trước khi làm:** điền `nguoi_lam` (và `id` nếu đã đặt) vào `topics.csv`, commit lên `master` rồi push, để người khác không làm trùng.

**Việc mỗi ngày (khoảng 20 phút):**

1. Đăng slot kế tiếp (skill `ekk-publish`). Điền `ngay_dang` vào `topics.csv`.
2. Trả lời đáp án câu đố của video hôm qua ở bình luận ghim.
3. Lấy số liệu của video đăng **7 ngày trước**, mỗi nền tảng một dòng trong `metrics.csv` (mục 5).
4. Ghi 1–2 dòng vào `NOTES.md` → Nhật ký nếu có gì đáng nhớ.
5. Commit trên `master`: `Publish: đăng slot N, số liệu slot N-7`.

## 5. Lấy số liệu từ TikTok và YouTube Shorts

**Quy ước:** lấy số **đúng 7 ngày sau khi đăng** (chấp nhận 8). Mỗi video có 2 dòng trong `tracking/metrics.csv`, `nen_tang` là `tiktok` hoặc `youtube`. Nhập số trơn, không dùng dấu phân cách hàng nghìn, phần thập phân dùng dấu chấm, ngày theo dạng `YYYY-MM-DD`. Ô nào nền tảng không có số thì để trống.

| Cột | YouTube Studio | TikTok Studio |
| --- | --- | --- |
| `thoi_luong_s` | Độ dài video (giây) | như YouTube |
| `luot_xem` | Lượt xem (Views) | Lượt xem video |
| `tg_xem_tb_s` | Thời lượng xem trung bình | Thời gian xem trung bình |
| `pct_xem_het` | để trống (Shorts không có số này) | Đã xem hết video (%) |
| `pct_giu_chan` | "Đã xem tiếp" (Stayed to watch), so với "Đã lướt qua" | Đọc % người xem ở **giây thứ 3** trên đường giữ chân (retention) |
| `thich`, `binh_luan`, `chia_se` | Lượt thích, bình luận, chia sẻ | như YouTube |
| `luu` | để trống | Lượt lưu (yêu thích) |
| `follow_moi` | Người đăng ký có được từ video | Người theo dõi mới |

**YouTube:** vào YouTube Studio → Nội dung → tab Shorts → bấm biểu tượng Số liệu phân tích của video. Tab Tổng quan có lượt xem và thời lượng xem trung bình. Tab Mức độ tương tác có tỉ lệ "Đã xem tiếp". Muốn lấy nhiều video một lúc thì dùng **Chế độ nâng cao** (Advanced mode) → Xuất (Export) ra CSV hoặc Google Sheets ([hướng dẫn của YouTube](https://support.google.com/youtube/answer/9002587)). Từ 2025, lượt xem Shorts tính cả lượt phát lại. "Lượt xem có tương tác" (Engaged views) là cách đếm cũ. Thử nghiệm này luôn dùng **Lượt xem** cho thống nhất.

**TikTok:** trên web vào `tiktok.com/tiktokstudio`, trên app vào Hồ sơ → ☰ → TikTok Studio. Chọn Phân tích → Nội dung → bấm vào video. Số liệu chỉ được giữ khoảng **60 ngày**, nên đừng để dồn. Nếu không thấy mục Phân tích, kiểm tra loại tài khoản trong phần Cài đặt.

Tên các mục trên hai nền tảng đổi theo từng bản cập nhật. Thấy khác bảng trên thì sửa lại tài liệu này để cả nhóm dùng chung một cách đọc.

## 6. Phân tích

```bash
python scripts/report.py                      # bảng theo nền tảng × dạng, dùng trung vị
python scripts/report.py > tracking/report.md # lưu lại để cả nhóm xem
```

Thứ tự ưu tiên khi đọc bảng:

1. **% giữ chân:** hook có giữ được người xem ở 3 giây đầu không. Dưới 70% là hook yếu.
2. **% xem TB, % xem hết:** nội dung có giữ được tới cuối không.
3. **Follow/1k:** dạng tập có biến người xem thành người theo dõi không. Đây là mục tiêu của kênh.
4. **Bình luận/1k, Lưu/1k:** người xem có tương tác thật và thấy đáng học không.
5. **Lượt xem:** nhiễu nhất (phụ thuộc thuật toán và tuổi kênh), chỉ dùng để tham khảo.

Mỗi dạng chỉ có 3–4 video nên kết quả là **xu hướng, không phải kết luận chắc chắn**. Chỉ tin khi một dạng hơn hoặc kém rõ rệt trên **cả hai** nền tảng.

## 7. Mốc quyết định

| Mốc | Xem gì | Quyết định |
| --- | --- | --- |
| Sau slot 15 (đã có số 7 ngày của khoảng 8 video) | Vùng đệm có giữ được không? Có dạng nào kém rõ rệt không? | Nghỉ quá 3 ngày vì không kịp làm thì cân nhắc giảm còn 5 tập/tuần. Một dạng có % giữ chân thấp hơn Gốc từ từ 15 điểm trở lên trên cả hai nền tảng thì thay các slot còn lại của dạng đó bằng dạng tốt nhất. |
| 7 ngày sau slot 30 (đủ số của cả 30 video) | Toàn bộ `report.py` | Giữ 2 dạng khác tốt nhất, bỏ dạng kém nhất, chốt tỉ lệ cho 30 ngày tiếp theo, chọn nền tảng ưu tiên. Ghi vào `NOTES.md` → Quyết định. |

## 8. Rủi ro

- **Chính sách "nội dung thiếu chân thực" của YouTube** (Content Plan 5.3): đan xen dạng tập và thêm giọng hoặc mặt thật ở Thử thách đoán giúp giảm rủi ro này.
- **Sai từ nguyên khi chạy theo nhịp mỗi ngày:** luật "hết vùng đệm thì nghỉ" ở mục 4 là để chặn chuyện này.
- **Kiệt sức:** cả nhóm dùng `NOTES.md` để chia việc. Ai nhận slot nào thì ghi tên vào `topics.csv`.
