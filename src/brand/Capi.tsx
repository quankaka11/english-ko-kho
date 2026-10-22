// Capi – linh vật capybara của kênh. Vẽ thuần SVG để không phụ thuộc ảnh ngoài.
// Mọi chuyển động (thở, chớp mắt, nói) lấy từ frame nên render ổn định.
import { interpolate, random, useCurrentFrame } from "remotion";
import { C } from "../brand";

export type CapiPose = "idle" | "point" | "wave" | "cheer";

type Props = {
  size?: number;
  pose?: CapiPose;
  /** Đang nói: miệng mấp máy. */
  talking?: boolean;
  /** Tắt chuyển động (ảnh tĩnh cho logo/avatar). */
  still?: boolean;
  /** Ẩn thân, chỉ còn đầu (dùng cho avatar, watermark). */
  headOnly?: boolean;
  /** Lệch pha chuyển động để nhiều Capi không nhúc nhích giống hệt nhau. */
  seed?: number;
};

export const Capi: React.FC<Props> = ({
  size = 400,
  pose = "idle",
  talking = false,
  still = false,
  headOnly = false,
  seed = 0,
}) => {
  const raw = useCurrentFrame();
  const frame = still ? 0 : raw + seed * 17;

  // Thở nhẹ: nhấp nhô 4px chu kỳ ~2s.
  const bob = still ? 0 : Math.sin(frame / 10) * 4;
  // Chớp mắt mỗi ~95 frame, kéo dài 6 frame.
  const blinkPhase = frame % 95;
  const eyeScale = still ? 1 : interpolate(blinkPhase, [0, 3, 6], [1, 0.1, 1], { extrapolateRight: "clamp" });
  // Nói: mở miệng theo nhiễu giả ngẫu nhiên đổi mỗi 3 frame.
  const mouthOpen = talking && !still ? 0.25 + random(`capi-mouth-${Math.floor(frame / 3)}`) * 0.75 : 0;
  // Vẫy tay / cổ vũ.
  const armSwing = pose === "wave" ? Math.sin(frame / 4) * 18 : pose === "cheer" ? Math.sin(frame / 5) * 8 : 0;
  // Quả cam lắc lư nhẹ.
  const orangeTilt = still ? -8 : -8 + Math.sin(frame / 14) * 4;

  const vb = headOnly ? "40 0 320 330" : "0 0 400 440";
  const height = headOnly ? (size * 330) / 320 : (size * 440) / 400;

  return (
    <svg width={size} height={height} viewBox={vb} style={{ overflow: "visible" }}>
      <g style={{ translate: `0px ${bob}px` }}>
        {!headOnly && (
          <>
            {/* Thân */}
            <ellipse cx={200} cy={360} rx={150} ry={90} fill={C.capiFur} />
            <ellipse cx={200} cy={380} rx={95} ry={55} fill={C.capiFurLight} opacity={0.55} />
            {/* Chân */}
            <ellipse cx={130} cy={432} rx={34} ry={14} fill={C.capiFurDark} />
            <ellipse cx={270} cy={432} rx={34} ry={14} fill={C.capiFurDark} />
            {/* Tay trái (phía người xem) */}
            <g style={{ transformOrigin: "110px 330px", rotate: `${pose === "cheer" ? 145 + armSwing : 10}deg` }}>
              <rect x={92} y={318} width={36} height={78} rx={18} fill={C.capiFurDark} />
            </g>
            {/* Tay phải: cầm thước / vẫy */}
            <g
              style={{
                transformOrigin: "290px 330px",
                rotate: `${pose === "point" ? -120 : pose === "wave" ? -150 + armSwing : pose === "cheer" ? -145 - armSwing : -10}deg`,
              }}
            >
              <rect x={272} y={318} width={36} height={78} rx={18} fill={C.capiFurDark} />
              {pose === "point" && (
                <g>
                  <rect x={284} y={380} width={12} height={130} rx={6} fill={C.accent} stroke={C.ink} strokeWidth={3} />
                  <circle cx={290} cy={512} r={10} fill={C.danger} stroke={C.ink} strokeWidth={3} />
                </g>
              )}
            </g>
          </>
        )}

        {/* Tai nhỏ, nằm cao – nét đặc trưng capybara */}
        <ellipse cx={122} cy={76} rx={19} ry={15} fill={C.capiFurDark} />
        <ellipse cx={278} cy={76} rx={19} ry={15} fill={C.capiFurDark} />

        {/* Đầu: khối "ổ bánh mì" vuông bo tròn */}
        <rect x={84} y={64} width={232} height={252} rx={96} fill={C.capiFur} />
        {/* Sống mũi hơi sẫm chạy từ trán xuống mõm */}
        <rect x={150} y={96} width={100} height={110} rx={50} fill={C.capiFurDark} opacity={0.18} />
        {/* Mõm to, vuông */}
        <rect x={108} y={168} width={184} height={140} rx={62} fill={C.capiFurLight} />
        {/* Lỗ mũi xếch, không có đệm mũi như gấu */}
        <ellipse cx={178} cy={196} rx={7} ry={12} fill={C.capiFurDark} style={{ transformOrigin: "178px 196px", rotate: "-25deg" }} />
        <ellipse cx={222} cy={196} rx={7} ry={12} fill={C.capiFurDark} style={{ transformOrigin: "222px 196px", rotate: "25deg" }} />
        <path d="M200 214 L200 236" stroke={C.capiFurDark} strokeWidth={5} strokeLinecap="round" />

        {/* Miệng */}
        {mouthOpen > 0 ? (
          <ellipse cx={200} cy={252} rx={20} ry={5 + mouthOpen * 15} fill={C.ink} />
        ) : (
          <path d="M178 238 Q189 252 200 238 Q211 252 222 238" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        )}

        {/* Mắt nhỏ, hiền, đặt cao */}
        <g style={{ transformOrigin: "200px 136px", scale: `1 ${eyeScale}` }}>
          <circle cx={138} cy={136} r={12} fill={C.ink} />
          <circle cx={262} cy={136} r={12} fill={C.ink} />
          <circle cx={142} cy={131} r={4} fill="#fff" />
          <circle cx={266} cy={131} r={4} fill="#fff" />
        </g>
        {/* Má hồng */}
        <ellipse cx={104} cy={196} rx={18} ry={11} fill={C.capiCheek} opacity={0.75} />
        <ellipse cx={296} cy={196} rx={18} ry={11} fill={C.capiCheek} opacity={0.75} />

        {/* Quả cam trên đầu – dấu hiệu nhận diện */}
        <g style={{ transformOrigin: "200px 60px", rotate: `${orangeTilt}deg` }}>
          <circle cx={200} cy={34} r={40} fill={C.capiOrange} stroke={C.capiFurDark} strokeWidth={4} />
          <circle cx={186} cy={22} r={9} fill="#fff" opacity={0.45} />
          <path d="M200 -6 Q224 -26 240 -8 Q218 2 200 -6 Z" fill={C.capiLeaf} />
          <rect x={196} y={-12} width={8} height={14} rx={3} fill={C.capiFurDark} />
        </g>
      </g>
    </svg>
  );
};
