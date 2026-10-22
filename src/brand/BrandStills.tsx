// Ảnh tĩnh của thương hiệu, xuất bằng `python scripts/export_brand.py`.
import { AbsoluteFill } from "remotion";
import { C, FONT, brand } from "../brand";
import { Capi } from "./Capi";
import { KoMark, Wordmark } from "./Logo";

const dots: React.CSSProperties = {
  backgroundColor: C.bg,
  backgroundImage: `radial-gradient(${C.bgAlt} 3px, transparent 3px)`,
  backgroundSize: "40px 40px",
};

/** Bảng nhận diện để duyệt nhanh: logo, mark, Capi các tư thế, màu. */
export const BrandSheet: React.FC = () => (
  <AbsoluteFill style={{ ...dots, padding: 80, fontFamily: FONT.body, color: C.ink }}>
    <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
      <Wordmark width={900} />
      <KoMark size={300} />
      <div style={{ background: C.ink, borderRadius: 40, padding: 30 }}>
        <Wordmark width={420} inverted />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 60, marginTop: 60 }}>
      {(["idle", "point", "wave", "cheer"] as const).map((p) => (
        <div key={p} style={{ textAlign: "center" }}>
          <Capi size={320} pose={p} still />
          <div style={{ fontSize: 34, fontWeight: 700, marginTop: 50 }}>{p}</div>
        </div>
      ))}
      <div style={{ textAlign: "center" }}>
        <Capi size={260} headOnly still />
        <div style={{ fontSize: 34, fontWeight: 700 }}>headOnly</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 24, marginTop: 50 }}>
      {Object.entries(C).map(([k, v]) => (
        <div key={k} style={{ textAlign: "center", width: 110 }}>
          <div style={{ height: 80, borderRadius: 20, background: v, border: `3px solid ${C.ink}` }} />
          <div style={{ fontSize: 18, marginTop: 8 }}>{k}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

/** Ảnh đại diện kênh (YouTube 800×800, TikTok tự thu nhỏ). Hiển thị dạng tròn. */
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: C.accent, justifyContent: "center", alignItems: "center" }}>
    <div style={{ position: "absolute", width: 760, height: 760, borderRadius: "50%", background: C.bg }} />
    <div style={{ position: "absolute", top: 150 }}>
      <Capi size={470} headOnly still />
    </div>
    <div style={{ position: "absolute", bottom: 70, right: 120 }}>
      <KoMark size={250} />
    </div>
  </AbsoluteFill>
);

/** Banner YouTube 2560×1440. Vùng an toàn mọi thiết bị: 1546×423 ở giữa. */
export const Banner: React.FC = () => (
  <AbsoluteFill style={{ ...dots, justifyContent: "center", alignItems: "center", fontFamily: FONT.body }}>
    <div style={{ display: "flex", alignItems: "center", gap: 50, width: 1546, height: 423 }}>
      <Capi size={330} pose="wave" still />
      <div>
        <Wordmark width={640} />
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink, marginTop: 10 }}>{brand.channel.tagline_vi}</div>
        <div style={{ fontSize: 34, fontWeight: 600, color: C.inkSoft, marginTop: 6 }}>
          {brand.channel.handle} · Shorts mới Thứ 3 · 5 · 7
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
