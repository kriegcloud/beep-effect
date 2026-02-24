"use client";

import { MentionElement, MentionInputElement } from "@beep/ui/components/mention-node";
import { MentionInputPlugin, MentionPlugin } from "@platejs/mention/react";

export const MentionKit = [
  MentionPlugin.configure({
    options: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  }).withComponent(MentionElement),
  MentionInputPlugin.withComponent(MentionInputElement),
];
