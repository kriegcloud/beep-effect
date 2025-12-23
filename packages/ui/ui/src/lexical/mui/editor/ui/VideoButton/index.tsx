import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import type { useModal } from "../../hooks";
import { YoutubeIcon } from "../../images/icons";
import { InsertVideoDialog } from "../../plugins";

interface IVideoButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ReturnType<typeof useModal>[1];
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
