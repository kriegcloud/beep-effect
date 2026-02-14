"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, type BaseSelection, COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical";
import { useCallback, useEffect } from "react";

/**
 * A hook that subscribes to Lexical selection changes and invokes a callback
 * with the current selection.
 *
 * This hook:
 * 1. Registers a command listener for SELECTION_CHANGE_COMMAND
 * 2. Immediately reads the current selection on mount
 * 3. Invokes the callback whenever selection changes
 *
 * @param callback - Function called with the current selection when it changes
 *
 * @example
 * ```tsx
 * function ToolbarPlugin() {
 *   const [isBold, setIsBold] = useState(false);
 *
 *   useUpdateToolbarHandler(
 *     useCallback((selection) => {
 *       if ($isRangeSelection(selection)) {
 *         setIsBold(selection.hasFormat("bold"));
 *       }
 *     }, [])
 *   );
 *
 *   return <button data-active={isBold}>Bold</button>;
 * }
 * ```
 */
export function useUpdateToolbarHandler(callback: (selection: BaseSelection) => void) {
  const [editor] = useLexicalComposerContext();

  // Stabilize callback reference to avoid unnecessary re-registrations
  const stableCallback = useCallback(callback, [callback]);

  // Register command listener for selection changes
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if (selection) {
          stableCallback(selection);
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, stableCallback]);

  // Read initial selection on mount and when editor changes
  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (selection) {
        stableCallback(selection);
      }
    });
  }, [editor, stableCallback]);
}

export default useUpdateToolbarHandler;
