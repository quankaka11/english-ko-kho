import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fadeUp } from "../anim";
import { C, FONT } from "../brand";
import { WordParts } from "../components/WordParts";
import { LAYOUT } from "../layout";
import type { Episode } from "../types";

/** Bảng tổng kết để người xem chụp màn hình. */
export const Summary: React.FC<{ episode: Episode }> = ({ episode }) => {
  const frame = useCurrentFrame();
  const n = episode.words.length;
  const rowSize = n > 6 ? 50 : 60;

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
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 64 }}>📸 Chụp lại để ôn!</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 52, color: C.root }}>-{episode.root.text}-</span>
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
            <span style={{ fontSize: rowSize * 0.66, fontWeight: 700, textAlign: "right" }}>{w.meaning_vi}</span>
          </div>
        ))}
      </div>
      {episode.disclaimer_vi && (
        <div style={{ ...fadeUp(frame, 20), marginTop: 12, fontSize: 26, color: C.inkSoft, textAlign: "center" }}>
          💡 {episode.disclaimer_vi}
        </div>
      )}
    </AbsoluteFill>
  );
};
