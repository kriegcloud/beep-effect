import { FORMAT_ELEMENT_COMMAND } from "lexical";
import type { FC } from "react";
import type { IToolbarComponentProps } from "../../../common";
import { TextRightIcon } from "../../images/icons";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";

interface IRightAlignButtonProps extends IToolbarComponentProps {
  isRightAlign: boolean;
}

export const RightAlignButton: FC<IRightAlignButtonProps> = ({ activeEditor, isRightAlign, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
      }}
      className={"toolbar-item spaced " + (isRightAlign ? "active" : "")}
      title={`Right Align (${SHORTCUTS.RIGHT_ALIGN})`}
      type="button"
      aria-label={`Format text as right align. Shortcut: ${SHORTCUTS.RIGHT_ALIGN}`}
    >
      <TextRightIcon />
    </button>
  );
};
