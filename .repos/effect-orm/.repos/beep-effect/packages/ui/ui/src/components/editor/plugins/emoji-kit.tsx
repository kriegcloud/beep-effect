"use client";

import type { UnsafeTypes } from "@beep/types";
import { EmojiInputElement } from "@beep/ui/components/emoji-node";
import emojiMartData from "@emoji-mart/data";
import { EmojiInputPlugin, EmojiPlugin } from "@platejs/emoji/react";

export const EmojiKit = [
  EmojiPlugin.configure({
    options: { data: emojiMartData as UnsafeTypes.UnsafeAny },
  }),
  EmojiInputPlugin.withComponent(EmojiInputElement),
];
