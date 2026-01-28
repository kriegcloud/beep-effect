"use client";

import { Button } from "@beep/ui/components/button";
import { IS_APPLE } from "@lexical/utils";
import { $addUpdateTag, type LexicalEditor, REDO_COMMAND, SKIP_DOM_SELECTION_TAG, UNDO_COMMAND } from "lexical";
import { Redo2, Undo2 } from "lucide-react";
import type { JSX } from "react";
import { useToolbarContext } from "../../../context/toolbar-context";
import { isKeyboardInput } from "../../../utils/focusUtils";

// ============================================================================
// Props
// ============================================================================

interface UndoRedoControlsProps {
  readonly editor: LexicalEditor;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Undo/Redo control buttons for the toolbar.
 * Uses toolbar context for state (canUndo, canRedo) and dispatches
 * UNDO_COMMAND/REDO_COMMAND to the provided editor.
 */
export function UndoRedoControls({ editor }: UndoRedoControlsProps): JSX.Element {
  const { toolbarState, activeEditor } = useToolbarContext();
  const { canUndo, canRedo } = toolbarState;

  // Check if the editor is editable
  const isEditable = editor.isEditable();

  /**
   * Dispatch an undo/redo command to the active editor.
   * Optionally skips DOM selection refocus for keyboard-triggered actions.
   */
  const dispatchCommand = (command: typeof UNDO_COMMAND | typeof REDO_COMMAND, skipRefocus: boolean) => {
    activeEditor.update(() => {
      if (skipRefocus) {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      }
      activeEditor.dispatchCommand(command, undefined);
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={!canUndo || !isEditable}
        onClick={(e) => dispatchCommand(UNDO_COMMAND, isKeyboardInput(e.nativeEvent))}
        title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
        aria-label={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={!canRedo || !isEditable}
        onClick={(e) => dispatchCommand(REDO_COMMAND, isKeyboardInput(e.nativeEvent))}
        title={IS_APPLE ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
        aria-label={IS_APPLE ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </>
  );
}
