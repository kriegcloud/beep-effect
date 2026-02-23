"use client";

import { FixedToolbar } from "@beep/ui/components/fixed-toolbar";
import { FixedToolbarButtons } from "@beep/ui/components/fixed-toolbar-buttons";
import { createPlatePlugin } from "platejs/react";

export const FixedToolbarKit = [
  createPlatePlugin({
    key: "fixed-toolbar",
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
