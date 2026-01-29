"use client";

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
        buttonClassName="toolbar-item color-picker"
        buttonAriaLabel="Formatting text color"
        buttonIconClassName="icon font-color"
        color={toolbarState.fontColor}
        onChange={(color, skipHistoryStack, skipRefocus) => applyStyleText({ color }, skipHistoryStack, skipRefocus)}
        title="text color"
      />
      <DropdownColorPicker
        disabled={disabled}
        buttonClassName="toolbar-item color-picker"
        buttonAriaLabel="Formatting background color"
        buttonIconClassName="icon bg-color"
        color={toolbarState.bgColor}
        onChange={(color, skipHistoryStack, skipRefocus) =>
          applyStyleText({ "background-color": color }, skipHistoryStack, skipRefocus)
        }
        title="bg color"
      />
    </>
  );
}

export default ColorPickerGroup;
