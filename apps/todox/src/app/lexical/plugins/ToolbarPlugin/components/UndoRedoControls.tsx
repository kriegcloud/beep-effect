"use client";

import { Button } from "@beep/ui/components/button";
import { IS_APPLE } from "@lexical/utils";
import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { $addUpdateTag, type LexicalEditor, REDO_COMMAND, SKIP_DOM_SELECTION_TAG, UNDO_COMMAND } from "lexical";
import type { JSX } from "react";
import { isKeyboardInput } from "../../../utils/focusUtils";

// ============================================================================
// Props
// ============================================================================

interface UndoRedoControlsProps {
  readonly editor: LexicalEditor;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Undo/Redo control buttons for the toolbar.
 * Dispatches UNDO_COMMAND/REDO_COMMAND to the provided editor.
 */
export function UndoRedoControls({ editor, canUndo, canRedo }: UndoRedoControlsProps): JSX.Element {
  // Check if the editor is editable
  const isEditable = editor.isEditable();

  /**
   * Dispatch an undo/redo command to the editor.
   * Optionally skips DOM selection refocus for keyboard-triggered actions.
   */
  const dispatchCommand = (command: typeof UNDO_COMMAND | typeof REDO_COMMAND, skipRefocus: boolean) => {
    editor.update(() => {
      if (skipRefocus) {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      }
      editor.dispatchCommand(command, undefined);
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
        <ArrowCounterClockwiseIcon className="h-4 w-4" />
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
        <ArrowClockwiseIcon className="h-4 w-4" />
      </Button>
    </>
  );
}
