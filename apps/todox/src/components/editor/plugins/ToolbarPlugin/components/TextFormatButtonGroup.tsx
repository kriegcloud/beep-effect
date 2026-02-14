"use client";

import { ToggleGroup, ToggleGroupItem } from "@beep/todox/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { CodeIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import { FORMAT_TEXT_COMMAND, type LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useMemo } from "react";
import { useToolbarState } from "../../../context/toolbar-context";
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
 * Uses ToggleGroup from @beep/ui to show pressed/active state for each format.
 * Supports multiple simultaneous selections (e.g., bold AND italic).
 * Dispatches FORMAT_TEXT_COMMAND to the Lexical editor when toggled.
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

  // Build the current value array from toolbar state
  const currentValue = useMemo(() => {
    const values: string[] = [];
    if (isBold) values.push("bold");
    if (isItalic) values.push("italic");
    if (isUnderline) values.push("underline");
    if (isCode) values.push("code");
    return values;
  }, [isBold, isItalic, isUnderline, isCode]);

  /**
   * Handle value changes from the toggle group.
   * Compares new values with current to determine which format to toggle.
   */
  const handleValueChange = (newValue: string[]) => {
    // Find added formats (in newValue but not in currentValue)
    const added = A.filter(newValue, (v) => !A.contains(currentValue, v));
    // Find removed formats (in currentValue but not in newValue)
    const removed = A.filter(currentValue, (v) => !A.contains(newValue, v));

    // Dispatch command for each toggled format
    for (const format of [...added, ...removed]) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as "bold" | "italic" | "underline" | "code");
    }
  };

  return (
    <ToggleGroup
      value={currentValue}
      onValueChange={handleValueChange}
      size="sm"
      variant="outline"
      aria-label="Text formatting"
    >
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <ToggleGroupItem
              {...props}
              value="bold"
              disabled={!isEditable}
              aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
            >
              <TextBIcon className="size-4" />
            </ToggleGroupItem>
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Bold ({SHORTCUTS.BOLD})
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <ToggleGroupItem
              {...props}
              value="italic"
              disabled={!isEditable}
              aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}
            >
              <TextItalicIcon className="size-4" />
            </ToggleGroupItem>
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Italic ({SHORTCUTS.ITALIC})
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <ToggleGroupItem
              {...props}
              value="underline"
              disabled={!isEditable}
              aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
            >
              <TextUnderlineIcon className="size-4" />
            </ToggleGroupItem>
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Underline ({SHORTCUTS.UNDERLINE})
        </TooltipContent>
      </Tooltip>

      {showCodeButton && (
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <ToggleGroupItem
                {...props}
                value="code"
                disabled={!isEditable}
                aria-label={`Insert code block. Shortcut: ${SHORTCUTS.INSERT_CODE_BLOCK}`}
              >
                <CodeIcon className="size-4" />
              </ToggleGroupItem>
            )}
          />
          <TooltipContent side="bottom" sideOffset={4}>
            Code ({SHORTCUTS.INSERT_CODE_BLOCK})
          </TooltipContent>
        </Tooltip>
      )}
    </ToggleGroup>
  );
}
