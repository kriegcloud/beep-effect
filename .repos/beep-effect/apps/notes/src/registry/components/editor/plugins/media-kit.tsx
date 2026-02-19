"use client";

import { MediaAudioElement } from "@beep/notes/registry/ui/media-audio-node";
import { MediaEmbedElement } from "@beep/notes/registry/ui/media-embed-node";
import { MediaFileElement } from "@beep/notes/registry/ui/media-file-node";
import { ImageElement } from "@beep/notes/registry/ui/media-image-node";
import { PlaceholderElement } from "@beep/notes/registry/ui/media-placeholder-node";
import { ImagePreview } from "@beep/notes/registry/ui/media-preview-dialog";
import { MediaUploadToast } from "@beep/notes/registry/ui/media-upload-toast";
import { MediaVideoElement } from "@beep/notes/registry/ui/media-video-node";
import { CaptionPlugin } from "@platejs/caption/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from "@platejs/media/react";
import { KEYS } from "platejs";

export const MediaKit = [
  PlaceholderPlugin.configure({
    render: {
      afterEditable: MediaUploadToast,
      node: PlaceholderElement,
    },
  }),
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: {
      afterEditable: ImagePreview,
      node: ImageElement,
    },
  }),
  MediaEmbedPlugin.withComponent(MediaEmbedElement),
  VideoPlugin.withComponent(MediaVideoElement),
  AudioPlugin.withComponent(MediaAudioElement),
  FilePlugin.withComponent(MediaFileElement),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.mediaEmbed],
      },
    },
  }),
];
