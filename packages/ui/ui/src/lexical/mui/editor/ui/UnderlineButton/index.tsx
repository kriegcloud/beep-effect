import { FORMAT_TEXT_COMMAND } from "lexical";
import type { FC } from "react";
import type { IToolbarComponentProps } from "../../../common";
import { TypeUnderlineIcon } from "../../images/icons";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";

interface IUnderlineButtonProps extends IToolbarComponentProps {
  isUnderline: boolean;
}

export const UnderlineButton: FC<IUnderlineButtonProps> = ({ activeEditor, isUnderline, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
      }}
      className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
      title={`Italic (${SHORTCUTS.UNDERLINE})`}
      type="button"
      aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.UNDERLINE}`}
    >
      <TypeUnderlineIcon />
    </button>
  );
};
