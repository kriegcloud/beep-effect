"use client";

import { FloatingToolbar } from "@beep/ui/components/floating-toolbar";
import { FloatingToolbarButtons } from "@beep/ui/components/floating-toolbar-buttons";
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
