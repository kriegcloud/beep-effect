import type { FC } from "react";
import type { IToolbarComponentProps } from "../../../common";
import { LinkIcon } from "../../images/icons";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";

interface ILinkButtonProps extends Omit<IToolbarComponentProps, "activeEditor"> {
  isLink: boolean;
  insertLink: () => void;
}

export const LinkButton: FC<ILinkButtonProps> = ({ insertLink, isLink, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={insertLink}
      className={`toolbar-item spaced ${isLink ? "active" : ""}`}
      aria-label="Insert link"
      title={`Insert link (${SHORTCUTS.INSERT_LINK})`}
      type="button"
    >
      <LinkIcon />
    </button>
  );
};
