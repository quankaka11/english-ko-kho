import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop } from "../anim";
import { C } from "../brand";
import { contentFrame, ExampleBox, IpaPos, MeaningTag, Progress } from "../components/CardParts";
import { WordParts } from "../components/WordParts";
import { clipStart, type Episode, type Scene } from "../types";

/** Một từ: ghép mảnh có màu + nghĩa từng mảnh, IPA, nghĩa, câu ví dụ (root_family, confusing_pair). */
export const WordCard: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = scene.data.index ?? 0;
  const total = scene.data.total ?? episode.words.length;
  const w = episode.words[index];
  const rootMeaning = episode.root?.meaning_vi;
  const parts = w.parts.map((p) => (p.type === "root" && !p.meaning_vi && rootMeaning ? { ...p, meaning_vi: rootMeaning } : p));

  const tWord = clipStart(scene, "_word");
  const voClip = scene.clips.find((c) => c.id.endsWith("_vo"));
  const tMeaning = voClip ? voClip.from + Math.round(voClip.duration * 0.55) : 40;
  const tEx = clipStart(scene, "_ex");
  const big = w.word.length > 10 ? 112 : 140;

  return (
    <AbsoluteFill style={contentFrame}>
      <Progress index={index} total={total} badge={w.mnemonic ? "💡 mẹo nhớ" : undefined} />

      <div style={{ marginTop: 34 }}>
        <WordParts parts={parts} fontSize={big} revealFrom={tWord} stagger={8} labels />
      </div>

      <IpaPos word={w} from={tWord + 12} />

      <MeaningTag text={w.meaning_vi} emoji={w.emoji} style={{ marginTop: 22, scale: `${pop(frame, fps, tMeaning)}` }} />
      {w.note_vi && (
        <div style={{ ...fadeUp(frame, tMeaning + 10), marginTop: 14, fontSize: 32, fontWeight: 700, color: C.danger }}>
          ⚠️ {w.note_vi}
        </div>
      )}

      <ExampleBox word={w} from={tEx} />
    </AbsoluteFill>
  );
};
