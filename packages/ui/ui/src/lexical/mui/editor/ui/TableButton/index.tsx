import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import type { useModal } from "../../hooks";
import { TableIcon } from "../../images/icons";
import { InsertTableDialog } from "../../plugins";

interface ITableButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ReturnType<typeof useModal>[1];
}

export const TableButton: FC<ITableButtonProps> = ({ activeEditor, showModal }) => {
  return (
    <button
      onClick={() => {
        showModal("Insert Table", (onClose) => <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      className={"toolbar-item spaced"}
      title="Table"
      type="button"
      aria-label="Table"
    >
      <TableIcon />
    </button>
  );
};
