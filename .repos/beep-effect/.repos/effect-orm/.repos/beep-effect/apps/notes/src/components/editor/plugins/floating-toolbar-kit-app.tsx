"use client";

import { FloatingToolbarButtons } from "@beep/notes/components/editor/ui/floating-toolbar-buttons-app";
import { FloatingToolbar } from "@beep/notes/registry/ui/floating-toolbar";
import { createPlatePlugin } from "platejs/react";

export const FloatingToolbarKit = [
  createPlatePlugin({
    key: "floating-toolbar",
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
];
