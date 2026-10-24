import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop } from "../anim";
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
  /** Frame bắt đầu hiện nhãn nghĩa (mặc định hiện cùng mảnh). Dùng khi muốn giấu nghĩa cho người xem đoán. */
  labelsFrom?: number | null;
  /** Chỉ tô màu mảnh gốc, các mảnh khác màu chữ thường (dùng ở Hook). */
  rootOnly?: boolean;
};

export const WordParts: React.FC<Props> = ({
  parts,
  fontSize = 140,
  revealFrom = null,
  stagger = 9,
  labels = false,
  labelsFrom = null,
  rootOnly = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingBottom: labels ? fontSize * 0.42 : 0,
      }}
    >
      {parts.map((p, i) => {
        const s = revealFrom === null ? 1 : pop(frame, fps, revealFrom + i * stagger);
        const color = rootOnly && p.type !== "root" ? C.ink : PART_COLOR[p.type];
        const labelOpacity = labelsFrom === null ? s : s * interpolate(frame, [labelsFrom, labelsFrom + 8], [0, 1], clamp);
        return (
          // Nhãn nằm tuyệt đối bên dưới để các mảnh luôn liền nhau thành một từ.
          <div key={i} style={{ position: "relative" }}>
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
            {labels && p.meaning_vi && (
              <>
                {/* Gạch chân dài đúng bằng mảnh chữ: thấy rõ ranh giới tiền tố / gốc / hậu tố */}
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 6,
                    right: 6,
                    height: 6,
                    borderRadius: 3,
                    background: color,
                    opacity: labelOpacity,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    translate: "-50% 12px",
                    fontFamily: FONT.body,
                    fontWeight: 700,
                    fontSize: fontSize * 0.24,
                    color,
                    whiteSpace: "nowrap",
                    opacity: labelOpacity,
                  }}
                >
                  {p.meaning_vi}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
