"use client";

import { BlockDraggable } from "@beep/notes/registry/ui/block-draggable";
import { DndPlugin } from "@platejs/dnd";
import { PlaceholderPlugin } from "@platejs/media/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const DndKit = [
  DndPlugin.configure({
    options: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        if (target) {
          editor.getTransforms(PlaceholderPlugin).insert.media(dragItem.files, { at: target, nextBlock: false });
        } else {
          editor.getTransforms(PlaceholderPlugin).insert.media(dragItem.files, { nextBlock: false });
        }
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      aboveSlate: ({ children }) => <DndProvider backend={HTML5Backend}>{children}</DndProvider>,
    },
  }),
];
