import { FORMAT_ELEMENT_COMMAND } from "lexical";
import type { FC } from "react";
import type { IToolbarComponentProps } from "../../../common";
import { TextLeftIcon } from "../../images/icons";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";

interface ILeftAlignButtonProps extends IToolbarComponentProps {
  isLeftAlign: boolean;
}

export const LeftAlignButton: FC<ILeftAlignButtonProps> = ({ activeEditor, isLeftAlign, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
      }}
      className={"toolbar-item spaced " + (isLeftAlign ? "active" : "")}
      title={`Left Align (${SHORTCUTS.LEFT_ALIGN})`}
      type="button"
      aria-label={`Format text as left align. Shortcut: ${SHORTCUTS.LEFT_ALIGN}`}
    >
      <TextLeftIcon />
    </button>
  );
};
