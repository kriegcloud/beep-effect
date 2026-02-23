import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import { FormatClearIcon } from "../../images/icons";

interface IClearButtonProp extends Omit<IToolbarComponentProps, "activeEditor"> {
  onClick: () => void;
}

export const ClearFormattingButton: FC<IClearButtonProp> = ({ onClick, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={"toolbar-item spaced"}
      title="Clear text formatting"
      type="button"
      aria-label="Clear all text formatting"
    >
      <FormatClearIcon />
    </button>
  );
};
