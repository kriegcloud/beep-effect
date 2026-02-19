import { MediaAudioElementStatic } from "@beep/notes/registry/ui/media-audio-node-static";
import { MediaFileElementStatic } from "@beep/notes/registry/ui/media-file-node-static";
import { ImageElementStatic } from "@beep/notes/registry/ui/media-image-node-static";
import { MediaVideoElementStatic } from "@beep/notes/registry/ui/media-video-node-static";
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
  BaseVideoPlugin.withComponent(MediaVideoElementStatic),
  BaseAudioPlugin.withComponent(MediaAudioElementStatic),
  BaseFilePlugin.withComponent(MediaFileElementStatic),
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
