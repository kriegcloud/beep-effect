"use client";

import { AudioElement } from "@beep/ui/components/media-audio-node";
import { MediaEmbedElement } from "@beep/ui/components/media-embed-node";
import { FileElement } from "@beep/ui/components/media-file-node";
import { ImageElement } from "@beep/ui/components/media-image-node";
import { PlaceholderElement } from "@beep/ui/components/media-placeholder-node";
import { MediaPreviewDialog } from "@beep/ui/components/media-preview-dialog";
import { MediaUploadToast } from "@beep/ui/components/media-upload-toast";
import { VideoElement } from "@beep/ui/components/media-video-node";
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
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog, node: ImageElement },
  }),
  MediaEmbedPlugin.withComponent(MediaEmbedElement),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { afterEditable: MediaUploadToast, node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
];
