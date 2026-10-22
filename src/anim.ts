// Các hàm animation dùng chung. Mọi thứ tính từ frame -> render ổn định.
import { Easing, interpolate, spring } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Bật ra có nảy nhẹ: 0 -> 1 bắt đầu tại `delay` frame. */
export const pop = (frame: number, fps: number, delay = 0, damping = 12) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 180, mass: 0.6 } });

/** Mờ dần + trượt lên. Trả về style. */
export const fadeUp = (frame: number, delay = 0, dist = 40, dur = 10): React.CSSProperties => ({
  opacity: interpolate(frame, [delay, delay + dur], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [delay, delay + dur], [dist, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px`,
});

/** Đi vào cảnh: trượt từ phải sang trong 8 frame. */
export const sceneEnter = (frame: number): React.CSSProperties => ({
  opacity: interpolate(frame, [0, 6], [0, 1], clamp),
  translate: `${interpolate(frame, [0, 8], [80, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px 0px`,
});

/** Nhịp đập nhẹ liên tục (dùng cho dấu ?, nút Theo dõi). */
export const pulse = (frame: number, period = 30, amount = 0.06) => 1 + Math.sin((frame / period) * Math.PI * 2) * amount;

export { clamp };
