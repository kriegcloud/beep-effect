"use client";

import { CodeLeaf } from "@beep/ui/components/code-node";
import { HighlightLeaf } from "@beep/ui/components/highlight-node";
import { KbdLeaf } from "@beep/ui/components/kbd-node";
import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";

export const BasicMarksKit = [
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  CodePlugin.configure({
    node: { component: CodeLeaf },
    shortcuts: { toggle: { keys: "mod+e" } },
  }),
  StrikethroughPlugin.configure({
    shortcuts: { toggle: { keys: "mod+shift+x" } },
  }),
  SubscriptPlugin.configure({
    shortcuts: { toggle: { keys: "mod+comma" } },
  }),
  SuperscriptPlugin.configure({
    shortcuts: { toggle: { keys: "mod+period" } },
  }),
  HighlightPlugin.configure({
    node: { component: HighlightLeaf },
    shortcuts: { toggle: { keys: "mod+shift+h" } },
  }),
  KbdPlugin.withComponent(KbdLeaf),
];
