"use client";

import { MentionElement, MentionInputElement } from "@beep/notes/components/editor/ui/mention-node-app";
import type { MyMentionElement } from "@beep/notes/registry/components/editor/plate-types";
import { MentionInputPlugin, MentionPlugin } from "@platejs/mention/react";
import { KEYS } from "platejs";

export const MentionKit = [
  MentionPlugin.configure({
    options: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  })
    .withComponent(MentionElement)
    .overrideEditor(({ api: { isSelectable } }) => ({
      api: {
        isSelectable(element) {
          if (element.type === KEYS.mention) {
            const mentionElement = element as unknown as MyMentionElement;

            return Boolean(mentionElement.key?.startsWith("/"));
          }

          return isSelectable(element);
        },
      },
    })),
  MentionInputPlugin.withComponent(MentionInputElement),
];
