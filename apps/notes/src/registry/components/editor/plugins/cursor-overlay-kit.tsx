"use client";

import { CursorOverlay } from "@beep/notes/registry/ui/cursor-overlay";
import { CursorOverlayPlugin } from "@platejs/selection/react";

export const CursorOverlayKit = [
  CursorOverlayPlugin.configure({
    render: {
      afterEditable: () => <CursorOverlay />,
    },
  }),
];
