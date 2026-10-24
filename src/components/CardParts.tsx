// Mảnh dùng chung cho các cảnh một-từ (WordCard, OriginCard, SinoCard, ChallengeCard).
import { useCurrentFrame } from "remotion";
import { fadeUp } from "../anim";
import { C, FONT } from "../brand";
import { LAYOUT } from "../layout";
import type { Word } from "../types";
import { PART_COLOR } from "./WordParts";

/** Khung nội dung chung: vùng an toàn giữa contentTop và contentBottom. */
export const contentFrame: React.CSSProperties = {
  top: LAYOUT.contentTop,
  height: LAYOUT.contentBottom - LAYOUT.contentTop,
  padding: `0 ${LAYOUT.pad}px`,
  alignItems: "center",
  fontFamily: FONT.body,
  color: C.ink,
};

/** Hàng trên cùng: nhãn bên trái (tuỳ chọn) + "Từ 3/8" + chấm tiến độ. */
export const Progress: React.FC<{ index: number; total: number; noun?: string; badge?: string }> = ({
  index,
  total,
  noun = "Từ",
  badge,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, alignSelf: "stretch", justifyContent: "flex-end" }}>
    {badge && (
      <span
        style={{
          marginRight: "auto",
          fontSize: 32,
          fontWeight: 700,
          background: C.card,
          border: `4px solid ${C.ink}`,
          borderRadius: 999,
          padding: "4px 18px",
        }}
      >
        {badge}
      </span>
    )}
    <span style={{ fontSize: 36, fontWeight: 800 }}>
      {noun} {index + 1}/{total}
    </span>
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: i <= index ? C.root : C.card,
            border: `3px solid ${C.ink}`,
          }}
        />
      ))}
    </div>
  </div>
);

/** IPA + loại từ. */
export const IpaPos: React.FC<{ word: Word; from: number }> = ({ word, from }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...fadeUp(frame, from), marginTop: 18, display: "flex", gap: 20, alignItems: "center" }}>
      <span style={{ fontFamily: FONT.ipa, fontSize: 48, color: C.inkSoft }}>{word.ipa}</span>
      <span style={{ fontSize: 34, fontWeight: 800, color: C.card, background: C.ink, borderRadius: 12, padding: "2px 14px" }}>
        {word.pos}
      </span>
    </div>
  );
};

/** Thẻ nghĩa nền vàng, có emoji. */
export const MeaningTag: React.FC<{ text: string; emoji?: string; size?: number; style?: React.CSSProperties }> = ({
  text,
  emoji,
  size,
  style,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, ...style }}>
    {emoji && <span style={{ fontSize: 90 }}>{emoji}</span>}
    <span
      style={{
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size ?? (text.length > 18 ? 62 : 80),
        lineHeight: 1.1,
        background: C.accent,
        border: `5px solid ${C.ink}`,
        borderRadius: 28,
        padding: "4px 28px",
        textAlign: "center",
      }}
    >
      {text}
    </span>
  </div>
);

/** Tô màu từ cần học trong câu ví dụ (khớp theo phần đầu của từ để bắt cả inspected, prospects...). */
const Highlighted: React.FC<{ sentence: string; word: string }> = ({ sentence, word }) => {
  const stem = word.toLowerCase().slice(0, Math.max(4, word.length - 2));
  return (
    <>
      {sentence.split(/(\s+)/).map((tok, i) =>
        tok.toLowerCase().replace(/[^a-z]/g, "").startsWith(stem) ? (
          <b key={i} style={{ color: C.root, background: `${C.accent}66`, borderRadius: 8, padding: "0 4px" }}>
            {tok}
          </b>
        ) : (
          <span key={i}>{tok}</span>
        ),
      )}
    </>
  );
};

/** Hộp câu ví dụ ở đáy vùng nội dung. compact: chữ nhỏ hơn cho cảnh nhiều tầng (OriginCard). */
export const ExampleBox: React.FC<{ word: Word; from: number; compact?: boolean }> = ({ word, from, compact = false }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...fadeUp(frame, from),
        position: "absolute",
        bottom: 0,
        left: LAYOUT.pad,
        right: LAYOUT.pad,
        background: C.card,
        border: `5px solid ${C.ink}`,
        borderLeft: `18px solid ${PART_COLOR.root}`,
        borderRadius: 30,
        padding: compact ? "12px 26px" : "20px 30px",
      }}
    >
      <div style={{ fontSize: compact ? 40 : 46, fontWeight: 600, lineHeight: 1.3 }}>
        <Highlighted sentence={word.example_en} word={word.word} />
      </div>
      {word.example_vi && <div style={{ fontSize: compact ? 30 : 34, color: C.inkSoft, marginTop: compact ? 2 : 6 }}>{word.example_vi}</div>}
    </div>
  );
};
