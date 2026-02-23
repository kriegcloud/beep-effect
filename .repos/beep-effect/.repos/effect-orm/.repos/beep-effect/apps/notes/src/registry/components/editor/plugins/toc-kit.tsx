"use client";

import { TocElement } from "@beep/notes/registry/ui/toc-node";
import { TocPlugin } from "@platejs/toc/react";

export const TocKit = [
  TocPlugin.configure({
    options: {
      isScroll: true,
      topOffset: 80,
    },
  }).withComponent(TocElement),
];
