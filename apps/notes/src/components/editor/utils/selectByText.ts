"use client";

import type { PlateEditor } from "platejs/react";

import { scrollSelectionIntoView } from "./scrollSelectionIntoView";
import { searchRange } from "./searchRanges";

export const selectByText = (editor: PlateEditor, text: string) => {
  const range = searchRange(editor, text);

  if (range) {
    editor.tf.focus({ at: range });
    scrollSelectionIntoView(editor);
  }

  return range;
};
