import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop, pulse } from "../anim";
import { C, FONT } from "../brand";
import { contentFrame, ExampleBox, IpaPos, MeaningTag, Progress } from "../components/CardParts";
import { WordParts } from "../components/WordParts";
import { clipStart, type Episode, type Scene } from "../types";

const RING = 150;

/** Vòng đếm ngược 3-2-1 trong lúc người xem tự đoán. */
const Countdown: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = Math.max(1, Math.ceil((from + duration - frame) / fps));
  const progress = interpolate(frame, [from, from + duration], [0, 1], clamp);
  const r = RING / 2 - 10;
  const len = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: RING, height: RING, scale: `${pulse(frame, fps, 0.05)}` }}>
      <svg width={RING} height={RING} style={{ position: "absolute", rotate: "-90deg" }}>
        <circle cx={RING / 2} cy={RING / 2} r={r} fill={C.card} stroke={C.bgAlt} strokeWidth={14} />
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={r}
          fill="none"
          stroke={C.prefix}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * progress}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 90,
          color: C.ink,
        }}
      >
        {left}
      </div>
    </div>
  );
};

/** Thử thách đoán: hiện từ (giấu nghĩa) → đếm ngược → lộ nghĩa từng mảnh + nghĩa cả từ → câu ví dụ. */
export const ChallengeCard: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = scene.data.index ?? 0;
  const total = scene.data.total ?? episode.words.length;
  const w = episode.words[index];
  const pause = scene.data.pause;

  const tWord = clipStart(scene, "_word");
  const tReveal = pause ? pause.from + pause.duration : clipStart(scene, "_vo");
  const tEx = clipStart(scene, "_ex");
  const big = w.word.length > 10 ? 112 : 140;
  const ticks = pause ? Math.round(pause.duration / fps) : 0;

  return (
    <AbsoluteFill style={contentFrame}>
      <Progress index={index} total={total} noun="Câu" badge={w.from_vi ? `📚 ${w.from_vi}` : undefined} />

      <div style={{ marginTop: 34 }}>
        <WordParts parts={w.parts} fontSize={big} revealFrom={tWord} stagger={8} labels labelsFrom={tReveal} />
      </div>
      <IpaPos word={w} from={tWord + 12} />

      <div style={{ marginTop: 22, height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {frame < tReveal ? (
          pause && frame >= pause.from ? (
            <Countdown from={pause.from} duration={pause.duration} />
          ) : (
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 80, opacity: interpolate(frame, [tWord + 10, tWord + 18], [0, 1], clamp) }}>
              🤔 Nghĩa là gì?
            </span>
          )
        ) : (
          <MeaningTag text={w.meaning_vi} emoji={w.emoji} style={{ scale: `${pop(frame, fps, tReveal)}` }} />
        )}
      </div>

      <ExampleBox word={w} from={tEx} />

      {pause &&
        Array.from({ length: ticks }).map((_, i) => (
          <Sequence key={i} from={pause.from + i * fps} durationInFrames={fps}>
            <Audio src={staticFile("sfx/tick.wav")} volume={0.5} />
          </Sequence>
        ))}
      <Sequence from={tReveal} durationInFrames={fps}>
        <Audio src={staticFile("sfx/ding.wav")} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};
