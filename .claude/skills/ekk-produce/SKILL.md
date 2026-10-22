---
name: ekk-produce
description: Dựng và render video một tập kênh English Ko Khó từ episode.json - sinh giọng đọc (ZipVoice + edge-tts), dựng timeline, render Remotion 1080x1920 có watermark/intro/outro, ảnh bìa, QA. Dùng khi người dùng nói "dựng video", "render tập", "build tập", "xem preview", "sửa template", "giọng đọc lỗi", "video bị lệch", "đổi intro/outro/watermark".
---

# Dựng video – English Ko Khó

Kiến trúc: `episode.json` → `make_audio.py` (mỗi câu VO là 1 clip wav + `timing.json`) → `build_props.py` (dòng thời gian theo frame → `public/episodes/<id>/props.json`) → Remotion `EpisodeVideo` → `out/<id>/`.

## Lệnh

```bash
python scripts/build.py <id> --preview     # duyệt nhanh, render nửa độ phân giải (~1 phút)
python scripts/build.py <id>               # bản cuối: mp4 -14 LUFS + cover.png + post.md + qa.txt
python scripts/build.py <id> --skip-audio  # đã có giọng, chỉ sửa hình
python scripts/build.py <id> --no-render   # chỉ giọng + props, rồi `npm run dev` để xem trong Studio
python scripts/build.py <id> --strict      # trước khi đăng: chặn nếu còn cảnh báo
```

Trong Studio (`npm run dev`), chọn composition `EpisodeVideo`, đặt prop `episodeId` = `<id>`.

Soát hình nhanh mà không cần mở Studio:

```bash
npx remotion still EpisodeVideo out/check.png --frame=<n> --scale=0.5 --props=out/<id>/render-props.json
```

Sau đó mở file png để xem. Hoặc cắt nhiều frame từ bản preview: `ffmpeg -ss <giây> -i out/<id>/<id>.preview.mp4 -frames:v 1 x.png`.

## Chuẩn bị (chỉ làm 1 lần mỗi máy)

1. `npm install` và `pip install -r requirements.txt`.
2. Tạo `.env` theo `.env.example`. **URL tunnel trycloudflare đổi mỗi lần server TTS khởi động lại**: lỗi kết nối ZipVoice thì việc đầu tiên là cập nhật `ZIPVOICE_URL`.
3. Cài Remotion Agent Skills (không commit): `npx remotion skills add`.

## Muốn sửa gì thì sửa ở đâu

| Muốn đổi | Sửa |
| --- | --- |
| Handle, câu CTA outro, bật/tắt intro, vị trí intro (`before_hook`/`after_hook`), độ mờ watermark, giọng, tốc độ, nhạc nền mặc định | `config/brand.json` |
| Logo / Capi | `src/brand/Logo.tsx`, `src/brand/Capi.tsx`, rồi chạy `python scripts/export_brand.py` |
| Bố cục, vùng an toàn | `src/layout.ts` |
| Từng cảnh | `src/scenes/*.tsx`; timeline (độ dài tối thiểu mỗi cảnh, SFX) ở `scripts/build_props.py` |
| Phụ đề | `src/components/SpeechBubble.tsx` (số chữ mỗi cụm: `voice.caption_words`) |

## Quy tắc Remotion trong repo này

- Animation chỉ dùng `useCurrentFrame()` + `interpolate`/`spring` (`src/anim.ts`). **Không** dùng CSS transition/animation.
- Audio dùng `<Audio>` của `@remotion/media`; file trong `public/` gọi qua `staticFile()`.
- Mọi phiên bản `@remotion/*` phải bằng đúng phiên bản `remotion` (đang ghim `4.0.532`).
- Màu, font lấy từ `src/brand.ts` (`C`, `FONT`), không viết cứng mã màu.
- Muốn nâng cấp Remotion thì dùng skill `remotion-upgrade`; tra API bằng `remotion-docs`.

## QA – xong khi

`out/<id>/qa.txt` có ✓ cho: 1080x1920, h264 yuv420p, 30 fps, aac, -14 ±1.5 LUFS. Ngoài ra phải xem tận mắt:

- Watermark nằm góc trên trái, không chồng lên nội dung; intro ~1.3 s ngay sau hook; outro có nút "Theo dõi" tự bấm.
- Chữ quan trọng nằm trong y 288–1440 px. Cột phải phía dưới và khoảng dưới 1450 px bị UI TikTok che.
- Phụ đề khớp tiếng; từ tiếng Anh được đọc bằng giọng Anh.

## Lỗi thường gặp

- `UnicodeEncodeError cp1252`: script phải `import common` (đã tự `reconfigure` UTF-8); khi chạy python một dòng thì đặt `PYTHONIOENCODING=utf-8`.
- Video ra `yuvj420p`: đã xử lý bằng `Config.setColorSpace("bt709")` trong `remotion.config.ts`, đừng xoá dòng này.
- Emoji cờ (🇬🇧) hiện thành chữ "GB" trên Windows: không dùng emoji cờ.
- Muốn sinh lại giọng sau khi sửa VO: cứ chạy lại `make_audio.py`, cache `.cache/tts/` tự bỏ qua những câu không đổi. Muốn đổi giọng thì sửa `brand.json`; cache theo hash nên giọng mới sẽ tự sinh lại.
- Tên kênh bị ASR nghe thành "có khó": kiểm tra `voice.lexicon` trong `brand.json`.
- `timing.json thiếu clip`: chạy lại `make_audio.py` sau khi thêm hoặc bớt từ.
