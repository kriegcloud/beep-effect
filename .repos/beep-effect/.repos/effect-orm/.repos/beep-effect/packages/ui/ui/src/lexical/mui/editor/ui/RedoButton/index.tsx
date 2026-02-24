import { IS_APPLE } from "@lexical/utils";
import { REDO_COMMAND } from "lexical";
import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import { ArrowClockwiseIcon } from "../../images/icons";

export const RedoButton: FC<IToolbarComponentProps> = ({ activeEditor, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        activeEditor.dispatchCommand(REDO_COMMAND, undefined);
      }}
      title={IS_APPLE ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
      type="button"
      className="toolbar-item"
      aria-label="Redo"
    >
      <ArrowClockwiseIcon />
    </button>
  );
};
