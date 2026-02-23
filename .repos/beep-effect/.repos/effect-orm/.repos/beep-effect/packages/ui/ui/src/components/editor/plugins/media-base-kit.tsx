import { AudioElementStatic } from "@beep/ui/components/media-audio-node-static";
import { FileElementStatic } from "@beep/ui/components/media-file-node-static";
import { ImageElementStatic } from "@beep/ui/components/media-image-node-static";
import { VideoElementStatic } from "@beep/ui/components/media-video-node-static";
import { BaseCaptionPlugin } from "@platejs/caption";
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
  BaseVideoPlugin,
} from "@platejs/media";
import { KEYS } from "platejs";

export const BaseMediaKit = [
  BaseImagePlugin.withComponent(ImageElementStatic),
  BaseVideoPlugin.withComponent(VideoElementStatic),
  BaseAudioPlugin.withComponent(AudioElementStatic),
  BaseFilePlugin.withComponent(FileElementStatic),
  BaseCaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
];
