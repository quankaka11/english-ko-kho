import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fadeUp, pulse } from "../anim";
import { C, FONT } from "../brand";
import { WordParts } from "../components/WordParts";
import { LAYOUT } from "../layout";
import type { Episode, Scene } from "../types";

/** Câu đố cuối: từ mới cùng gốc, che nghĩa, mời bình luận. */
export const Quiz: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { quiz } = episode;
  const tWord = scene.clips[0]?.from ?? 0;
  const tVo = scene.clips[1]?.from ?? 20;

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.contentTop,
        height: LAYOUT.contentBottom - LAYOUT.contentTop,
        alignItems: "center",
        fontFamily: FONT.body,
        color: C.ink,
      }}
    >
      <div style={{ ...fadeUp(frame, 0), fontFamily: FONT.display, fontWeight: 800, fontSize: 80 }}>🤔 Đoán nghĩa?</div>
      <div style={{ marginTop: 30 }}>
        <WordParts parts={quiz.parts} fontSize={quiz.word.length > 11 ? 110 : 140} revealFrom={tWord} stagger={8} />
      </div>
      {quiz.ipa && (
        <div style={{ ...fadeUp(frame, tWord + 10), fontFamily: FONT.ipa, fontSize: 44, color: C.inkSoft }}>{quiz.ipa}</div>
      )}
      <div
        style={{
          ...fadeUp(frame, tWord + 12),
          marginTop: 24,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 130,
          color: C.card,
          background: C.ink,
          borderRadius: 40,
          padding: "0 60px",
          scale: `${pulse(frame, 24, 0.05)}`,
        }}
      >
        = ???
      </div>
      <div
        style={{
          ...fadeUp(frame, tVo),
          marginTop: 34,
          fontSize: 44,
          fontWeight: 700,
          background: C.card,
          border: `4px solid ${C.ink}`,
          borderRadius: 24,
          padding: "10px 26px",
        }}
      >
        Gợi ý: {quiz.hint_vi}
      </div>
      <div style={{ ...fadeUp(frame, tVo + 20), marginTop: 26, fontSize: 48, fontWeight: 800, color: C.prefix }}>
        💬 Trả lời ở bình luận nhé!
      </div>
    </AbsoluteFill>
  );
};
