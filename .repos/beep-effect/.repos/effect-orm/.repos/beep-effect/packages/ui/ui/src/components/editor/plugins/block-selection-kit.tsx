"use client";

import { BlockSelection } from "@beep/ui/components/block-selection";
import { AIChatPlugin } from "@platejs/ai/react";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import * as A from "effect/Array";
import { getPluginTypes, isHotkey, KEYS } from "platejs";
export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    options: {
      enableContextMenu: true,
      isSelectable: (element) => {
        const excludedTypes = getPluginTypes(editor, [KEYS.column, KEYS.codeLine, KEYS.td]);
        return !A.contains(excludedTypes, element.type);
      },
      onKeyDownSelecting: (editor, e) => {
        if (isHotkey("mod+j")(e)) {
          editor.getApi(AIChatPlugin).aiChat.show();
        }
      },
    },
    render: {
      belowRootNodes: (props) => {
        const className = props.attributes.className;
        if (typeof className === "string" && !className.includes("slate-selectable")) return null;
        return <BlockSelection {...props} />;
      },
    },
  })),
];
