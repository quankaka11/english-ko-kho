# Nhạc nền

Đặt file nhạc nền vào thư mục này rồi khai báo trong `episode.json`:

```json
"music": { "file": "music/ten-file.mp3", "source": "YouTube Audio Library – <tên bài> – <giấy phép>", "volume": 0.07 }
```

Hoặc đặt nhạc mặc định cho cả kênh ở `config/brand.json` → `music.file`.

Chỉ dùng nhạc có giấy phép rõ ràng: YouTube Audio Library (loại không yêu cầu ghi công, hoặc ghi công vào mô tả), TikTok Commercial Music Library, hoặc nhạc CC0. Luôn ghi nguồn vào `source` để `make_post.py` tự chèn phần ghi công vào mô tả.

Lưu ý: nhạc YouTube Audio Library dùng được trên YouTube, nhưng không mặc định được phép dùng trên TikTok. Nếu đăng TikTok, nên tắt nhạc trong file render rồi chọn nhạc ngay trong app TikTok (thư viện thương mại).
