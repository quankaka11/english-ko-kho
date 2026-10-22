// Bố cục khung 1080×1920, tránh vùng bị UI TikTok/YouTube Shorts che:
// - trên cùng ~0–190px: thanh "Đang theo dõi | Dành cho bạn", nút LIVE, tìm kiếm
// - cột phải ~x>950, y 900–1650: nút tim, bình luận, chia sẻ
// - dưới ~y>1450: tên kênh, caption, thanh nhạc
export const LAYOUT = {
  pad: 56,
  watermarkTop: 200,
  contentTop: 320,
  contentBottom: 1060,
  capiTop: 1075,
  capiLeft: 36,
  capiSize: 250,
  bubble: { left: 300, top: 1095, width: 660, height: 220 },
} as const;
