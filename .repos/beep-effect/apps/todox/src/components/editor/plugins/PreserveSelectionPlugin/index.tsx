"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  type LexicalCommand,
  type RangeSelection,
} from "lexical";
import { useEffect, useRef } from "react";

// Co-located commands - avoids circular dependency with commands.ts
export const SAVE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("SAVE_SELECTION");
export const RESTORE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("RESTORE_SELECTION");

export function PreserveSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const savedSelection = useRef<RangeSelection | null>(null);

  useEffect(() => {
    const saveSelection = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Clone to preserve state even if original selection changes
        savedSelection.current = selection.clone();
      }
      return true;
    };

    const restoreSelection = () => {
      if (savedSelection.current) {
        $setSelection(savedSelection.current.clone());
      }
      return true;
    };

    const unregisterSave = editor.registerCommand(SAVE_SELECTION_COMMAND, saveSelection, COMMAND_PRIORITY_LOW);

    const unregisterRestore = editor.registerCommand(RESTORE_SELECTION_COMMAND, restoreSelection, COMMAND_PRIORITY_LOW);

    return () => {
      unregisterSave();
      unregisterRestore();
    };
  }, [editor]);

  return null;
}
