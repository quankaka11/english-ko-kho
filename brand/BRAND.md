# Nhận diện thương hiệu – English Ko Khó

Giá trị cụ thể (mã màu, handle, câu CTA, giọng đọc) nằm ở `config/brand.json`. Muốn đổi thì sửa file đó, mọi video và ảnh sẽ tự cập nhật theo. File này chỉ giải thích *vì sao* và *dùng thế nào*.

## Tên & thông điệp

| Mục | Giá trị |
| --- | --- |
| Tên kênh | **English Ko Khó**, nghĩa là "tiếng Anh không khó". Viết không dấu: English Ko Kho |
| Handle | `@englishkokho` (dùng chung TikTok + YouTube) |
| Tagline | Biết 1 gốc từ, hiểu cả họ từ |
| Lời hứa với người xem | Mỗi video chỉ 60–90 giây, học được cả một "họ từ" chứ không phải 1 từ lẻ |

## Logo

- **Mark "Ko"** (`KoMark` trong `src/brand/Logo.tsx`): sticker vàng nghiêng −6°, viền và bóng đổ màu navy. Chữ **o** là bong bóng thoại màu cam (ý: *nói* tiếng Anh), cạnh đó có tia sáng (ý: "à, hiểu rồi!"). Dùng cho watermark, icon, avatar.
- **Wordmark** (`Wordmark`): "English" màu xanh ở trên, mark "Ko" và chữ "Khó" ở dưới, có nét gạch cam như bút dạ. Dùng ở intro, outro, banner.
- Bản trên nền tối: `<Wordmark inverted />`.
- Không được: kéo méo tỉ lệ, đổi màu "o", bỏ viền navy, đặt lên nền ảnh rối.

Ảnh đã xuất sẵn nằm trong `brand/exports/` (chạy lại bằng `python scripts/export_brand.py`):

| File | Dùng cho |
| --- | --- |
| `avatar-800.png` | Ảnh đại diện YouTube / TikTok (hai nền tảng đều tự cắt tròn) |
| `youtube-banner-2560x1440.png` | Ảnh bìa YouTube; nội dung nằm trong vùng an toàn 1546×423 |
| `brand-sheet.png` | Bảng tổng hợp để duyệt hoặc gửi cộng tác viên |

## Linh vật: Capi 🍊

Capi là một con capybara (chuột lang nước) đội quả cam trên đầu. Dáng "chill", không bao giờ hoảng, đúng với tinh thần "ko khó đâu". Câu cửa miệng: *"Ko khó đâu!"*

- Vẽ hoàn toàn bằng SVG (`src/brand/Capi.tsx`), là nhân vật gốc của kênh nên không vướng bản quyền.
- Tư thế: `idle`, `point` (cầm thước chỉ bảng), `wave` (chào ở outro), `cheer` (khi đáp án đúng); có thêm `headOnly` cho avatar.
- Chuyển động: thở nhẹ, chớp mắt, miệng mấp máy khi `talking`. Mọi chuyển động đều tính theo frame nên render ra kết quả giống nhau mỗi lần.
- Không dùng nhân vật có bản quyền như Pikachu, Doraemon hay meme có người thật.

## Màu

| Vai trò | Token | Dùng cho |
| --- | --- | --- |
| Tiền tố | `prefix` (cam) | Mảnh tiền tố trong từ: **in**spect |
| Gốc từ | `root` (xanh dương) | Mảnh gốc: in**spect** |
| Hậu tố | `suffix` (xanh lá) | Mảnh hậu tố: spect**ator** |
| Nhấn | `accent` (vàng) | Sticker "Ko", nút Theo dõi, highlight phụ đề |
| Chữ | `ink` (navy) | Toàn bộ chữ chính, viền |
| Nền | `bg` / `bgAlt` | Nền kem có chấm bi |

Ba màu cam, xanh dương, xanh lá được cố định cho tiền tố, gốc và hậu tố ở mọi tập. Người xem sẽ quen mã màu này, nên tuyệt đối không dùng cho việc khác.

## Font (Google Fonts, có dấu tiếng Việt)

- **Baloo 2** (800): tiêu đề, từ vựng, logo. Nét tròn, thân thiện.
- **Be Vietnam Pro**: lời giải thích, phụ đề. Font thiết kế cho tiếng Việt nên dấu rất rõ.
- **Noto Sans**: phiên âm IPA (ɪ ə ˈ ː…), vì hai font trên thiếu một số ký tự IPA.

## Giọng văn

- Xưng "mình", gọi người xem là "bạn". Câu ngắn, nói như đang giảng cho bạn cùng bàn.
- Dùng "ko" thay cho "không" trên màn hình khi muốn chơi chữ với tên kênh (lời đọc vẫn viết "không" để TTS đọc chuẩn).
- Mẹo nhớ phải được gọi rõ là *mẹo nhớ*, không trình bày như sự thật từ nguyên (xem `documents/Content_Plan.md` mục 5).
