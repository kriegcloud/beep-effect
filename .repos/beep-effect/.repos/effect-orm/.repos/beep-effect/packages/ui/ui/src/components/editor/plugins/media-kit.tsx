"use client";

import { AudioElement } from "@beep/ui/components/media-audio-node";
import { MediaEmbedElement } from "@beep/ui/components/media-embed-node";
import { FileElement } from "@beep/ui/components/media-file-node";
import { ImageElement } from "@beep/ui/components/media-image-node";

import { MediaPreviewDialog } from "@beep/ui/components/media-preview-dialog";
import { VideoElement } from "@beep/ui/components/media-video-node";
import { CaptionPlugin } from "@platejs/caption/react";
import { AudioPlugin, FilePlugin, ImagePlugin, MediaEmbedPlugin, VideoPlugin } from "@platejs/media/react";
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
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
];
