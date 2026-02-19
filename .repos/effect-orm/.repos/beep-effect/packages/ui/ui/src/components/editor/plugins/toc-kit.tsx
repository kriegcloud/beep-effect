"use client";

import { TocElement } from "@beep/ui/components/toc-node";
import { TocPlugin } from "@platejs/toc/react";

export const TocKit = [
  TocPlugin.configure({
    options: {
      // isScroll: true,
      topOffset: 80,
    },
  }).withComponent(TocElement),
];
