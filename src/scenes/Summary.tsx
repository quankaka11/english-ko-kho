import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fadeUp } from "../anim";
import { C, FONT } from "../brand";
import { WordParts } from "../components/WordParts";
import { formatOf } from "../formats";
import { LAYOUT } from "../layout";
import type { Episode, Word } from "../types";

/** Cột phải của bảng: Hán Việt với sino_vietnamese, còn lại là nghĩa; nguồn gốc ghi nhỏ bên dưới. */
const RightCell: React.FC<{ w: Word; size: number }> = ({ w, size }) => (
  <div style={{ textAlign: "right" }}>
    <div style={{ fontSize: size * 0.66, fontWeight: 700 }}>{w.han_viet ?? w.meaning_vi}</div>
    {w.origin_vi && <div style={{ fontSize: size * 0.44, fontWeight: 600, color: C.prefix }}>{w.origin_vi}</div>}
  </div>
);

/** Bảng tổng kết để người xem chụp màn hình. */
export const Summary: React.FC<{ episode: Episode }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const n = episode.words.length;
  const rowSize = n > 6 ? 50 : 60;
  const tip = episode.summary.tip_vi;

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.contentTop - 10,
        height: LAYOUT.contentBottom - LAYOUT.contentTop + 20,
        padding: `0 ${LAYOUT.pad}px`,
        fontFamily: FONT.body,
        color: C.ink,
      }}
    >
      <div style={{ ...fadeUp(frame, 0), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 64 }}>{formatOf(episode.format).summary_title}</span>
        {episode.root && (
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 52, color: C.root }}>-{episode.root.text}-</span>
        )}
      </div>
      <div
        style={{
          marginTop: 14,
          background: C.card,
          border: `5px solid ${C.ink}`,
          borderRadius: 34,
          boxShadow: `8px 10px 0 ${C.ink}`,
          overflow: "hidden",
        }}
      >
        {episode.words.map((w, i) => (
          <div
            key={w.word}
            style={{
              ...fadeUp(frame, 4 + i * 3, 20, 8),
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: n > 6 ? "8px 26px" : "14px 26px",
              background: i % 2 ? C.bg : C.card,
              gap: 20,
            }}
          >
            <WordParts parts={w.parts} fontSize={rowSize} />
            <RightCell w={w} size={rowSize} />
          </div>
        ))}
      </div>
      {tip && (
        <div
          style={{
            ...fadeUp(frame, 4 + n * 3 + 4),
            marginTop: 22,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.3,
            background: C.accent,
            border: `5px solid ${C.ink}`,
            borderRadius: 26,
            padding: "12px 26px",
          }}
        >
          💡 {tip}
        </div>
      )}
      {episode.disclaimer_vi && (
        <div style={{ ...fadeUp(frame, 20), marginTop: 12, fontSize: 26, color: C.inkSoft, textAlign: "center" }}>
          {tip ? "" : "💡 "}
          {episode.disclaimer_vi}
        </div>
      )}
    </AbsoluteFill>
  );
};
