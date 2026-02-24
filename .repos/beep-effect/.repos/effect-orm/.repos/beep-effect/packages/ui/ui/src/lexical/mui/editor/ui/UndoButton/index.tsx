import { IS_APPLE } from "@lexical/utils";
import { UNDO_COMMAND } from "lexical";
import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import { ArrowCounterclockwiseIcon } from "../../images/icons";

export const UndoButton: FC<IToolbarComponentProps> = ({ activeEditor, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
      }}
      title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
      type="button"
      className="toolbar-item spaced"
      aria-label="Undo"
    >
      <ArrowCounterclockwiseIcon />
    </button>
  );
};
