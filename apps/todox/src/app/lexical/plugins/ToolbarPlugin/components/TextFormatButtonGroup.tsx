"use client";

import { Toggle } from "@beep/ui/components/toggle";
import { $addUpdateTag, FORMAT_TEXT_COMMAND, type LexicalEditor, SKIP_DOM_SELECTION_TAG } from "lexical";
import { Bold, Code, Italic, Underline } from "lucide-react";
import type { JSX, MouseEvent } from "react";
import { useToolbarState } from "../../../context/toolbar-context";
import { isKeyboardInput } from "../../../utils/focusUtils";
import { SHORTCUTS } from "../../ShortcutsPlugin/shortcuts";

// ============================================================================
// Types
// ============================================================================

interface TextFormatButtonGroupProps {
  /**
   * The active Lexical editor instance to dispatch formatting commands to.
   */
  readonly editor: LexicalEditor;
  /**
   * Whether to show the inline code formatting button.
   * Hide when in image caption context.
   * @default true
   */
  readonly showCodeButton?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * A button group for basic text formatting operations: Bold, Italic, Underline, and Code.
 *
 * Uses Toggle components from @beep/ui to show pressed/active state for each format.
 * Dispatches FORMAT_TEXT_COMMAND to the Lexical editor when clicked.
 *
 * Keyboard shortcuts are displayed in tooltips:
 * - Bold: Cmd/Ctrl+B
 * - Italic: Cmd/Ctrl+I
 * - Underline: Cmd/Ctrl+U
 * - Code: Cmd/Ctrl+Shift+C
 */
export function TextFormatButtonGroup({ editor, showCodeButton = true }: TextFormatButtonGroupProps): JSX.Element {
  const { toolbarState } = useToolbarState();
  const { isBold, isItalic, isUnderline, isCode } = toolbarState;

  // Check if editor is editable
  const isEditable = editor.isEditable();

  /**
   * Dispatches a text format command to the editor.
   * Handles keyboard-triggered events by skipping DOM selection updates
   * to prevent focus issues.
   */
  const handleFormatClick = (
    format: "bold" | "italic" | "underline" | "code",
    event: MouseEvent<HTMLButtonElement>
  ) => {
    const skipRefocus = isKeyboardInput(event);

    editor.update(() => {
      if (skipRefocus) {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      }
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    });
  };

  return (
    <div className="flex gap-0.5" role="group" aria-label="Text formatting">
      {/* Bold */}
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        onClick={(e) => handleFormatClick("bold", e)}
        disabled={!isEditable}
        aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
        title={`Bold (${SHORTCUTS.BOLD})`}
      >
        <Bold className="size-4" />
      </Toggle>

      {/* Italic */}
      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        onClick={(e) => handleFormatClick("italic", e)}
        disabled={!isEditable}
        aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}
        title={`Italic (${SHORTCUTS.ITALIC})`}
      >
        <Italic className="size-4" />
      </Toggle>

      {/* Underline */}
      <Toggle
        size="sm"
        pressed={isUnderline}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        onClick={(e) => handleFormatClick("underline", e)}
        disabled={!isEditable}
        aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
        title={`Underline (${SHORTCUTS.UNDERLINE})`}
      >
        <Underline className="size-4" />
      </Toggle>

      {/* Code (inline) */}
      {showCodeButton && (
        <Toggle
          size="sm"
          pressed={isCode}
          onPressedChange={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
          }}
          onClick={(e) => handleFormatClick("code", e)}
          disabled={!isEditable}
          aria-label={`Insert code block. Shortcut: ${SHORTCUTS.INSERT_CODE_BLOCK}`}
          title={`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`}
        >
          <Code className="size-4" />
        </Toggle>
      )}
    </div>
  );
}
