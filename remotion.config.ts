// Cấu hình CLI Remotion (studio + render). Xem https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709"); // tránh yuvj420p (full range) – màu chuẩn trên TikTok/YouTube
Config.setCrf(18);
Config.setAudioCodec("aac");
Config.setAudioBitrate("192k");
