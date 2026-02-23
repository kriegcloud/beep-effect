"use client";

import { FloatingToolbar } from "@beep/notes/registry/ui/floating-toolbar";
import { FloatingToolbarButtons } from "@beep/notes/registry/ui/floating-toolbar-buttons";
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
