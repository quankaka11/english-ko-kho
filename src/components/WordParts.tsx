import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../anim";
import { C, FONT } from "../brand";
import type { Part, PartType } from "../types";

export const PART_COLOR: Record<PartType, string> = {
  prefix: C.prefix,
  root: C.root,
  suffix: C.suffix,
  plain: C.ink,
};

type Props = {
  parts: Part[];
  fontSize?: number;
  /** Frame bắt đầu hiện từng mảnh; null = hiện ngay toàn bộ. */
  revealFrom?: number | null;
  /** Số frame giữa hai mảnh. */
  stagger?: number;
  /** Hiện nghĩa nhỏ dưới mỗi mảnh. */
  labels?: boolean;
  /** Chỉ tô màu mảnh gốc, các mảnh khác màu chữ thường (dùng ở Hook). */
  rootOnly?: boolean;
};

export const WordParts: React.FC<Props> = ({
  parts,
  fontSize = 140,
  revealFrom = null,
  stagger = 9,
  labels = false,
  rootOnly = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      {parts.map((p, i) => {
        const s = revealFrom === null ? 1 : pop(frame, fps, revealFrom + i * stagger);
        const color = rootOnly && p.type !== "root" ? C.ink : PART_COLOR[p.type];
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize,
                lineHeight: 1.05,
                color,
                opacity: s,
                scale: `${interpolate(s, [0, 1], [0.4, 1])}`,
                display: "inline-block",
              }}
            >
              {p.text}
            </span>
            {labels && (
              <span
                style={{
                  marginTop: 6,
                  minHeight: fontSize * 0.3,
                  fontFamily: FONT.body,
                  fontWeight: 700,
                  fontSize: fontSize * 0.24,
                  color,
                  opacity: s,
                  borderTop: p.meaning_vi ? `6px solid ${color}` : "none",
                  padding: "6px 10px 0",
                  whiteSpace: "nowrap",
                }}
              >
                {p.meaning_vi ?? ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
