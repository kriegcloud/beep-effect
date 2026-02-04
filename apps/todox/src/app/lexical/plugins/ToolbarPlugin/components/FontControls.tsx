"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";
import { $patchStyleText } from "@lexical/selection";
import { $addUpdateTag, $getSelection, type LexicalEditor, SKIP_SELECTION_FOCUS_TAG } from "lexical";
import type { JSX } from "react";
import { useCallback } from "react";
import { useToolbarState } from "../../../context/toolbar-context";
import FontSize, { parseFontSizeForToolbar } from "../fontSize";

// ============================================================================
// Constants
// ============================================================================

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

// ============================================================================
// Types
// ============================================================================

interface FontControlsProps {
  /**
   * The active Lexical editor instance to dispatch style changes to.
   */
  readonly editor: LexicalEditor;
  /**
   * Whether the controls should be disabled.
   * @default false
   */
  readonly disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Font controls for the toolbar, combining font family selection and font size adjustment.
 *
 * The font family dropdown allows selecting from predefined font families.
 * The font size controls allow incrementing/decrementing or direct input of font size.
 *
 * Uses the toolbar context to get current selection's font family and size,
 * and dispatches style changes to the Lexical editor.
 */
export function FontControls({ editor, disabled = false }: FontControlsProps): JSX.Element {
  const { toolbarState } = useToolbarState();
  const { fontFamily, fontSize } = toolbarState;

  /**
   * Handles font family selection change.
   * Updates the selection's font-family style property.
   */
  const handleFontFamilyChange = useCallback(
    (value: string | null) => {
      if (value == null) return;
      editor.update(() => {
        $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            "font-family": value,
          });
        }
      });
    },
    [editor]
  );

  // Parse font size for the FontSize component (remove 'px' suffix)
  const parsedFontSize = parseFontSizeForToolbar(fontSize).slice(0, -2);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Font controls">
      {/* Font Family Dropdown */}
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <span {...props}>
              <Select value={fontFamily} onValueChange={handleFontFamilyChange} disabled={disabled}>
                <SelectTrigger className="h-8 w-[90px] text-xs px-2" aria-label="Formatting options for font family">
                  <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILY_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      <span style={{ fontFamily: value }}>{label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </span>
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Font family
        </TooltipContent>
      </Tooltip>

      {/* Font Size Controls */}
      <FontSize selectionFontSize={parsedFontSize} editor={editor} disabled={disabled} />
    </div>
  );
}
