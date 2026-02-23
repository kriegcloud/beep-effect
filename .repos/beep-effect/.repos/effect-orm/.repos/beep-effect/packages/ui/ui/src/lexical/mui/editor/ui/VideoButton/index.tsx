import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import type { ShowModalFn } from "../../hooks/useModal.types";
import { YoutubeIcon } from "../../images/icons";
import { InsertVideoDialog } from "../../plugins/VideoPlugin";

interface IVideoButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ShowModalFn;
}

export const VideoButton: FC<IVideoButtonProps> = ({ activeEditor, showModal }) => {
  return (
    <button
      onClick={() => {
        showModal("Insert Video", (onClose) => <InsertVideoDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      className={"toolbar-item spaced"}
      title="Video"
      type="button"
      aria-label="Image"
    >
      <YoutubeIcon />
    </button>
  );
};
