"use client";

import { PlaceholderElement } from "@beep/notes/components/editor/ui/media-placeholder-node-app";
import { MediaKit as RegistryMediaKit } from "@beep/notes/registry/components/editor/plugins/media-kit";
import { MediaUploadToast } from "@beep/notes/registry/ui/media-upload-toast";
import { PlaceholderPlugin } from "@platejs/media/react";

export const MediaKit = [
  ...RegistryMediaKit,
  PlaceholderPlugin.configure({
    render: {
      afterEditable: MediaUploadToast,
      node: PlaceholderElement,
    },
  }),
];
