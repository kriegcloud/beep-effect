import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import type { ShowModalFn } from "../../hooks/useModal.types";
import { FileImageIcon } from "../../images/icons";
import { InsertImageDialog } from "../../plugins/ImagesPlugin";

interface IImageButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ShowModalFn;
}

export const ImageButton: FC<IImageButtonProps> = ({ activeEditor, showModal }) => {
  return (
    <button
      onClick={() => {
        showModal("Insert Image", (onClose) => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      className={"toolbar-item spaced"}
      title="Image"
      type="button"
      aria-label="Image"
    >
      <FileImageIcon />
    </button>
  );
};
