"use client";

import { BlockList } from "@beep/ui/components/block-list";
import { IndentKit } from "@beep/ui/components/editor/plugins/indent-kit";
import { ListPlugin } from "@platejs/list/react";
import { KEYS } from "platejs";

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inject: {
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote, KEYS.codeBlock, KEYS.toggle, KEYS.img],
    },
    render: {
      belowNodes: BlockList,
    },
  }),
];
