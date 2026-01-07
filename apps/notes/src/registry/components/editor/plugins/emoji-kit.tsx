"use client";

import { EmojiInputElement } from "@beep/notes/registry/ui/emoji-node";
import emojiMartData from "@emoji-mart/data";
import { EmojiInputPlugin, EmojiPlugin } from "@platejs/emoji/react";

export const EmojiKit = [
  EmojiPlugin.configure({
    // biome-ignore lint/suspicious/noExplicitAny: emoji-mart data type compatibility
    options: { data: emojiMartData as any },
  }),
  EmojiInputPlugin.withComponent(EmojiInputElement),
];
