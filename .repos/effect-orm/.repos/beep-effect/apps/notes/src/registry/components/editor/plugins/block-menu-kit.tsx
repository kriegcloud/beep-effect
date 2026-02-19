"use client";

import { BlockContextMenu } from "@beep/notes/registry/ui/block-context-menu";
import { BlockMenuPlugin } from "@platejs/selection/react";

import { BlockSelectionKit } from "./block-selection-kit";

export const BlockMenuKit = [
  ...BlockSelectionKit,
  BlockMenuPlugin.configure({
    render: { aboveSlate: BlockContextMenu },
  }),
];
