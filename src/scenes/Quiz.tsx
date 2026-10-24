import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop, pulse } from "../anim";
import { C, FONT } from "../brand";
import { WordParts } from "../components/WordParts";
import { LAYOUT } from "../layout";
import type { Episode, Scene } from "../types";

/** Câu điền từ: câu có chỗ trống nhấp nháy + các lựa chọn A/B/C. */
const FillBlank: React.FC<{ sentence: string; options: string[]; from: number }> = ({ sentence, options, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [before, after] = sentence.split("___");
  return (
    <>
      <div
        style={{
          ...fadeUp(frame, from),
          marginTop: 30,
          background: C.card,
          border: `5px solid ${C.ink}`,
          borderRadius: 30,
          padding: "22px 32px",
          fontSize: 56,
          fontWeight: 600,
          lineHeight: 1.35,
          textAlign: "center",
        }}
      >
        {before}
        <span
          style={{
            display: "inline-block",
            minWidth: 170,
            borderBottom: `8px solid ${C.prefix}`,
            color: C.prefix,
            fontWeight: 800,
            scale: `${pulse(frame, 24, 0.05)}`,
          }}
        >
          ?
        </span>
        {after}
      </div>
      <div style={{ marginTop: 30, display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center" }}>
        {options.map((o, i) => (
          <div
            key={o}
            style={{
              scale: `${pop(frame, fps, from + 10 + i * 6)}`,
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 72,
              background: i % 2 ? C.root : C.prefix,
              color: C.card,
              border: `5px solid ${C.ink}`,
              borderRadius: 28,
              padding: "0 34px",
              boxShadow: `6px 8px 0 ${C.ink}`,
            }}
          >
            {String.fromCharCode(65 + i)}. {o}
          </div>
        ))}
      </div>
    </>
  );
};

/** Câu đố cuối: từ mới che nghĩa hoặc câu điền từ, mời bình luận. */
export const Quiz: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { quiz } = episode;
  const wordClip = scene.clips.find((c) => c.id === "quiz_word");
  const voClip = scene.clips.find((c) => c.id === "quiz");
  const tWord = wordClip?.from ?? 0;
  const tVo = voClip?.from ?? 20;

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.contentTop,
        height: LAYOUT.contentBottom - LAYOUT.contentTop,
        padding: `0 ${LAYOUT.pad}px`,
        alignItems: "center",
        fontFamily: FONT.body,
        color: C.ink,
      }}
    >
      <div style={{ ...fadeUp(frame, 0), fontFamily: FONT.display, fontWeight: 800, fontSize: 80 }}>
        {quiz.word ? "🤔 Đoán nghĩa?" : "🤔 Điền từ nào?"}
      </div>
      {quiz.word && quiz.parts ? (
        <>
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
        </>
      ) : (
        <FillBlank sentence={quiz.sentence_en ?? "___"} options={quiz.options ?? []} from={4} />
      )}
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
