// Kiểu dữ liệu của public/episodes/<id>/props.json (sinh bởi scripts/build_props.py).

export type PartType = "prefix" | "root" | "suffix" | "plain";
export type Part = { text: string; type: PartType; meaning_vi?: string };

export type Word = {
  word: string;
  parts: Part[];
  ipa: string;
  pos: string;
  meaning_vi: string;
  vo: string;
  example_en: string;
  example_vi?: string;
  emoji?: string;
  mnemonic?: boolean;
  note_vi?: string;
  /** surprising_origin */
  origin_vi?: string;
  then_vi?: string;
  /** sino_vietnamese */
  han_viet?: string;
  /** guess_challenge */
  from_vi?: string;
};

export type Episode = {
  id: string;
  episode: number;
  format: string;
  title_vi: string;
  hook: { vo: string; on_screen: string };
  /** root_family có root; các dạng khác có topic (config/formats.json). */
  root?: { text: string; variants?: string[]; origin: string; meaning_vi: string; emoji?: string; vo: string };
  topic?: { title: string; subtitle_vi?: string; emoji?: string; vo: string };
  words: Word[];
  summary: { vo: string; tip_vi?: string };
  quiz: {
    word?: string;
    parts?: Part[];
    sentence_en?: string;
    options?: string[];
    ipa?: string;
    hint_vi: string;
    vo: string;
    answer_vi: string;
  };
  disclaimer_vi?: string | null;
};

export type Clip = { id: string; src: string; from: number; duration: number };
export type Caption = { from: number; to: number; text: string; lang: "vi" | "en" };

export type SceneType =
  | "hook"
  | "intro"
  | "root"
  | "topic"
  | "word"
  | "origin"
  | "sino"
  | "challenge"
  | "summary"
  | "quiz"
  | "outro";
export type Scene = {
  type: SceneType;
  from: number;
  duration: number;
  clips: Clip[];
  captions: Caption[];
  /** pause: khoảng lặng chờ người xem đoán (guess_challenge), frame tương đối trong cảnh. */
  data: { index?: number; total?: number; pause?: { from: number; duration: number } };
  sfx: string | null;
};

export type EpisodeProps = {
  episodeId: string;
  fps: number;
  durationInFrames: number;
  episode: Episode;
  scenes: Scene[];
  music: { file: string; volume?: number; source?: string } | null;
};

/** Mốc bắt đầu (frame, tương đối trong cảnh) của một clip theo id, ví dụ "w1_ex". */
export const clipStart = (scene: Scene, suffix: string): number =>
  scene.clips.find((c) => c.id.endsWith(suffix))?.from ?? 0;
