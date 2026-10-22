// Composition chính: đọc public/episodes/<id>/props.json và dựng toàn bộ tập.
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { brand } from "./brand";
import { Capi, type CapiPose } from "./brand/Capi";
import { Background } from "./components/Background";
import { SpeechBubble } from "./components/SpeechBubble";
import { Watermark } from "./components/Watermark";
import { LAYOUT } from "./layout";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Quiz } from "./scenes/Quiz";
import { RootIntro } from "./scenes/RootIntro";
import { Summary } from "./scenes/Summary";
import { WordCard } from "./scenes/WordCard";
import type { Caption, EpisodeProps, Scene, SceneType } from "./types";

export type EpisodeVideoProps = { episodeId: string; data?: EpisodeProps };

export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeVideoProps> = async ({ props }) => {
  const res = await fetch(staticFile(`episodes/${props.episodeId}/props.json`));
  if (!res.ok) {
    throw new Error(
      `Không đọc được public/episodes/${props.episodeId}/props.json – chạy: python scripts/build.py ${props.episodeId} --no-render`,
    );
  }
  const data = (await res.json()) as EpisodeProps;
  return { durationInFrames: data.durationInFrames, fps: data.fps, props: { ...props, data } };
};

const CAPI_POSE: Partial<Record<SceneType, CapiPose>> = {
  hook: "idle",
  root: "point",
  word: "point",
  summary: "cheer",
  quiz: "idle",
};

/** Không dùng watermark/Capi/phụ đề chung ở các cảnh đã có bố cục riêng. */
const FULLSCREEN: SceneType[] = ["intro", "outro"];

const SceneBody: React.FC<{ scene: Scene; data: EpisodeProps; talking: boolean }> = ({ scene, data, talking }) => {
  const ep = data.episode;
  switch (scene.type) {
    case "hook":
      return <Hook scene={scene} episode={ep} />;
    case "intro":
      return <Intro />;
    case "root":
      return <RootIntro scene={scene} episode={ep} />;
    case "word":
      return <WordCard scene={scene} episode={ep} />;
    case "summary":
      return <Summary episode={ep} />;
    case "quiz":
      return <Quiz scene={scene} episode={ep} />;
    case "outro":
      return <Outro talking={talking} />;
  }
};

export const EpisodeVideo: React.FC<EpisodeVideoProps> = ({ data }) => {
  const frame = useCurrentFrame();
  if (!data) return null;

  const current = data.scenes.find((s) => frame >= s.from && frame < s.from + s.duration) ?? data.scenes[0];
  const talking = current.clips.some((c) => {
    const t = frame - current.from - c.from;
    return t >= 0 && t < c.duration;
  });
  const overlay = !FULLSCREEN.includes(current.type);
  const captions: Caption[] = data.scenes.flatMap((s) =>
    FULLSCREEN.includes(s.type) ? [] : s.captions.map((c) => ({ ...c, from: c.from + s.from, to: c.to + s.from })),
  );

  return (
    <AbsoluteFill>
      <Background />

      {data.scenes.map((s, i) => (
        <Sequence key={i} name={`${i + 1}. ${s.type}`} from={s.from} durationInFrames={s.duration}>
          <SceneBody scene={s} data={data} talking={talking} />
          {s.sfx && <Audio src={staticFile(s.sfx)} volume={0.5} />}
          {s.clips.map((c) => (
            <Sequence key={c.id} name={c.id} from={c.from} durationInFrames={c.duration + 2}>
              <Audio src={staticFile(c.src)} />
            </Sequence>
          ))}
        </Sequence>
      ))}

      {overlay && (
        <>
          {brand.watermark.enabled && <Watermark />}
          <div style={{ position: "absolute", left: LAYOUT.capiLeft, top: LAYOUT.capiTop }}>
            <Capi size={LAYOUT.capiSize} pose={CAPI_POSE[current.type] ?? "idle"} talking={talking} />
          </div>
          <SpeechBubble captions={captions} />
        </>
      )}

      {data.music && <Audio src={staticFile(data.music.file)} volume={data.music.volume ?? brand.music.volume} loop />}
    </AbsoluteFill>
  );
};
