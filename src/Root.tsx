import { Composition, Folder, Still } from "remotion";
import { FPS, H, W } from "./brand";
import { Avatar, Banner, BrandSheet } from "./brand/BrandStills";
import { Cover } from "./Cover";
import { calculateEpisodeMetadata, EpisodeVideo } from "./EpisodeVideo";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Đổi episodeId trong panel Props của Studio để xem tập khác. */}
    <Composition
      id="EpisodeVideo"
      component={EpisodeVideo}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={FPS * 60}
      defaultProps={{ episodeId: "000-demo" }}
      calculateMetadata={calculateEpisodeMetadata}
    />
    <Still
      id="Cover"
      component={Cover}
      width={W}
      height={H}
      defaultProps={{ episodeId: "000-demo" }}
      calculateMetadata={calculateEpisodeMetadata}
    />
    <Folder name="Brand">
      <Still id="BrandSheet" component={BrandSheet} width={2400} height={1500} />
      <Still id="Avatar" component={Avatar} width={800} height={800} />
      <Still id="Banner" component={Banner} width={2560} height={1440} />
    </Folder>
  </>
);
