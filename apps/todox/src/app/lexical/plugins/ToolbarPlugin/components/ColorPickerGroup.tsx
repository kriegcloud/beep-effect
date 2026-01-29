"use client";

import { HighlighterCircleIcon, TextAaIcon } from "@phosphor-icons/react";
import { useToolbarState } from "../../../context/toolbar-context";
import DropdownColorPicker from "../../../ui/DropdownColorPicker";

interface ColorPickerGroupProps {
  /**
   * Callback to apply style changes to the current selection.
   * @param styles - Record of CSS properties to apply (e.g., { color: "#ff0000" })
   * @param skipHistoryStack - If true, the change won't create a new undo entry
   * @param skipRefocus - If true, the editor won't refocus after the change
   */
  readonly applyStyleText: (styles: Record<string, string>, skipHistoryStack?: boolean, skipRefocus?: boolean) => void;
  /**
   * When true, the color pickers are disabled.
   */
  readonly disabled?: boolean;
}

/**
 * ColorPickerGroup renders the font color and background color pickers
 * as a grouped toolbar element. It reads current color values from the
 * toolbar context and delegates style application to the parent.
 */
export function ColorPickerGroup({ applyStyleText, disabled = false }: ColorPickerGroupProps) {
  const { toolbarState } = useToolbarState();

  return (
    <>
      <DropdownColorPicker
        disabled={disabled}
        buttonAriaLabel="Text color"
        icon={<TextAaIcon className="size-4" />}
        color={toolbarState.fontColor}
        onChange={(color, skipHistoryStack, skipRefocus) => applyStyleText({ color }, skipHistoryStack, skipRefocus)}
        title="Text color"
      />
      <DropdownColorPicker
        disabled={disabled}
        buttonAriaLabel="Background color"
        icon={<HighlighterCircleIcon className="size-4" />}
        color={toolbarState.bgColor}
        onChange={(color, skipHistoryStack, skipRefocus) =>
          applyStyleText({ "background-color": color }, skipHistoryStack, skipRefocus)
        }
        title="Background color"
      />
    </>
  );
}

export default ColorPickerGroup;
