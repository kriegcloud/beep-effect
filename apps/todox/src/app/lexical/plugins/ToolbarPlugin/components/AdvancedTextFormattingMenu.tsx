"use client";

import { Button } from "@beep/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";
import { cn } from "@beep/todox/lib/utils";
import {
  DotsThreeIcon,
  EraserIcon,
  HighlighterIcon,
  TextAaIcon,
  TextStrikethroughIcon,
  TextSubscriptIcon,
  TextSuperscriptIcon,
} from "@phosphor-icons/react";
import {
  $addUpdateTag,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  SKIP_DOM_SELECTION_TAG,
  type TextFormatType,
} from "lexical";
import type { JSX, MouseEvent } from "react";
import { useToolbarState } from "../../../context/toolbar-context";
import { isKeyboardInput } from "../../../utils/focusUtils";
import { SHORTCUTS } from "../../ShortcutsPlugin/shortcuts";
import { clearFormatting } from "../utils";

// ============================================================================
// Types
// ============================================================================

interface AdvancedTextFormattingMenuProps {
  /**
   * The active Lexical editor instance to dispatch formatting commands to.
   */
  readonly editor: LexicalEditor;
  /**
   * Whether the menu trigger button is disabled.
   * @default false
   */
  readonly disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * A dropdown menu for advanced text formatting options that are less frequently used.
 *
 * Includes:
 * - Text case transforms: Lowercase, Uppercase, Capitalize
 * - Text decorations: Strikethrough, Subscript, Superscript, Highlight
 * - Clear formatting
 *
 * Uses DropdownMenuCheckboxItem for toggleable formats (strikethrough, subscript, superscript, highlight)
 * to show active state with a checkmark.
 *
 * Uses regular DropdownMenuItem for one-time actions (case transforms, clear formatting).
 */
export function AdvancedTextFormattingMenu({ editor, disabled = false }: AdvancedTextFormattingMenuProps): JSX.Element {
  const { toolbarState } = useToolbarState();
  const { isStrikethrough, isSubscript, isSuperscript, isHighlight, isLowercase, isUppercase, isCapitalize } =
    toolbarState;

  /**
   * Dispatches a text format command to the editor.
   * Handles keyboard-triggered events by skipping DOM selection updates
   * to prevent focus issues.
   */
  const handleFormatClick = (format: TextFormatType, event: MouseEvent<HTMLElement>) => {
    const skipRefocus = isKeyboardInput(event);

    editor.update(() => {
      if (skipRefocus) {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      }
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    });
  };

  /**
   * Clears all text formatting from the current selection.
   */
  const handleClearFormatting = (event: MouseEvent<HTMLElement>) => {
    const skipRefocus = isKeyboardInput(event);
    clearFormatting(editor, skipRefocus);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <DropdownMenuTrigger
              {...props}
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Formatting options for additional text styles"
                  className={cn("gap-1", "toolbar-item spaced")}
                >
                  <DotsThreeIcon className="size-4" />
                </Button>
              }
            />
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          More formatting
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" sideOffset={4} className="min-w-52">
        {/* Text Case Transforms */}
        <DropdownMenuItem
          onClick={(e) => handleFormatClick("lowercase", e)}
          className={cn("cursor-pointer", isLowercase && "bg-accent")}
        >
          <TextAaIcon className="size-4" />
          <span>Lowercase</span>
          <DropdownMenuShortcut>{SHORTCUTS.LOWERCASE}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleFormatClick("uppercase", e)}
          className={cn("cursor-pointer", isUppercase && "bg-accent")}
        >
          <TextAaIcon className="size-4" />
          <span>Uppercase</span>
          <DropdownMenuShortcut>{SHORTCUTS.UPPERCASE}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleFormatClick("capitalize", e)}
          className={cn("cursor-pointer", isCapitalize && "bg-accent")}
        >
          <TextAaIcon className="size-4" />
          <span>Capitalize</span>
          <DropdownMenuShortcut>{SHORTCUTS.CAPITALIZE}</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Text Decorations (Toggleable) */}
        <DropdownMenuCheckboxItem
          checked={isStrikethrough}
          onClick={(e) => handleFormatClick("strikethrough", e)}
          className="cursor-pointer"
        >
          <TextStrikethroughIcon className="size-4" />
          <span>Strikethrough</span>
          <DropdownMenuShortcut>{SHORTCUTS.STRIKETHROUGH}</DropdownMenuShortcut>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isSubscript}
          onClick={(e) => handleFormatClick("subscript", e)}
          className="cursor-pointer"
        >
          <TextSubscriptIcon className="size-4" />
          <span>Subscript</span>
          <DropdownMenuShortcut>{SHORTCUTS.SUBSCRIPT}</DropdownMenuShortcut>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isSuperscript}
          onClick={(e) => handleFormatClick("superscript", e)}
          className="cursor-pointer"
        >
          <TextSuperscriptIcon className="size-4" />
          <span>Superscript</span>
          <DropdownMenuShortcut>{SHORTCUTS.SUPERSCRIPT}</DropdownMenuShortcut>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isHighlight}
          onClick={(e) => handleFormatClick("highlight", e)}
          className="cursor-pointer"
        >
          <HighlighterIcon className="size-4" />
          <span>Highlight</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        {/* Clear Formatting */}
        <DropdownMenuItem onClick={handleClearFormatting} className="cursor-pointer">
          <EraserIcon className="size-4" />
          <span>Clear Formatting</span>
          <DropdownMenuShortcut>{SHORTCUTS.CLEAR_FORMATTING}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
