// Cấu hình các dạng tập: config/formats.json (Python cũng đọc file này).
import formatsJson from "../config/formats.json";

export type FormatKey = keyof typeof formatsJson;
export type FormatConfig = (typeof formatsJson)[FormatKey];

export const formatOf = (key: string): FormatConfig =>
  (formatsJson as Record<string, FormatConfig>)[key] ?? formatsJson.root_family;

/** Chữ to đại diện cho tập: -SPECT- với root_family, tiêu đề chủ đề với các dạng khác. */
export const headlineOf = (ep: { root?: { text: string }; topic?: { title: string } }): string =>
  ep.root ? `-${ep.root.text}-` : (ep.topic?.title ?? "");
