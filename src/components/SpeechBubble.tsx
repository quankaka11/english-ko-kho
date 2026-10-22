import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../anim";
import { C, FONT } from "../brand";
import { LAYOUT } from "../layout";
import type { Caption } from "../types";

/**
 * Phụ đề hiển thị như lời Capi nói (bong bóng thoại cạnh linh vật).
 * Từ đang đọc được tô nền vàng; vị trí từ ước lượng theo độ dài ký tự.
 * `captions` dùng frame tuyệt đối của toàn video.
 */
export const SpeechBubble: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const cap = captions.find((c) => frame >= c.from && frame < Math.max(c.to, c.from + 8));
  if (!cap) return null;

  const words = cap.text.split(" ");
  const total = cap.text.length;
  const progress = interpolate(frame, [cap.from, Math.max(cap.to, cap.from + 1)], [0, total], clamp);
  let acc = 0;
  const active = words.findIndex((w) => {
    acc += w.length + 1;
    return acc > progress;
  });
  const enter = interpolate(frame, [cap.from, cap.from + 4], [0.92, 1], clamp);
  const isEn = cap.lang === "en";
  const { left, top, width, height } = LAYOUT.bubble;

  return (
    <div style={{ position: "absolute", left, top, width, height, display: "flex", alignItems: "center" }}>
      {/* Đuôi bong bóng chỉ về Capi */}
      <div
        style={{
          position: "absolute",
          left: -26,
          top: height / 2 - 22,
          width: 0,
          height: 0,
          borderTop: "22px solid transparent",
          borderBottom: "22px solid transparent",
          borderRight: `30px solid ${C.ink}`,
        }}
      />
      <div
        style={{
          width: "100%",
          maxHeight: height,
          background: C.card,
          border: `6px solid ${C.ink}`,
          borderRadius: 40,
          padding: "22px 30px",
          boxShadow: `8px 10px 0 ${C.ink}`,
          scale: `${enter}`,
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: 50,
          lineHeight: 1.3,
          color: isEn ? C.root : C.ink,
          fontStyle: isEn ? "italic" : "normal",
          textAlign: "center",
        }}
      >
        {isEn && (
          <span
            style={{
              fontSize: 26,
              fontStyle: "normal",
              fontWeight: 800,
              color: C.card,
              background: C.root,
              borderRadius: 10,
              padding: "2px 10px",
              marginRight: 12,
              verticalAlign: "middle",
            }}
          >
            EN
          </span>
        )}
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              background: i === active ? C.accent : "transparent",
              borderRadius: 12,
              padding: "0 6px",
              marginRight: 2,
            }}
          >
            {w}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};
