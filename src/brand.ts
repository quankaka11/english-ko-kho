// Nguồn sự thật duy nhất cho thương hiệu: config/brand.json (Python cũng đọc file này).
import { loadFont as loadBaloo } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadBeVietnam } from "@remotion/google-fonts/BeVietnamPro";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSans";
import brandJson from "../config/brand.json";

export const brand = brandJson;
export const C = brand.colors;

const display = loadBaloo("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});
const body = loadBeVietnam("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});
const ipa = loadNotoSans("normal", {
  weights: ["400", "500"],
  subsets: ["latin", "latin-ext"],
});

export const FONT = {
  display: display.fontFamily,
  body: body.fontFamily,
  ipa: ipa.fontFamily,
};

export const W = brand.video.width;
export const H = brand.video.height;
export const FPS = brand.video.fps;

/** Vùng an toàn theo chiều dọc (px): chữ quan trọng nằm trong khoảng này. */
export const SAFE = {
  top: (H * brand.video.safe_top_pct) / 100,
  bottom: (H * brand.video.safe_bottom_pct) / 100,
};
