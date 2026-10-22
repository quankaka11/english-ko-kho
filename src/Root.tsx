import { Folder, Still } from "remotion";
import { Avatar, Banner, BrandSheet } from "./brand/BrandStills";

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Brand">
      <Still id="BrandSheet" component={BrandSheet} width={2400} height={1500} />
      <Still id="Avatar" component={Avatar} width={800} height={800} />
      <Still id="Banner" component={Banner} width={2560} height={1440} />
    </Folder>
  </>
);
