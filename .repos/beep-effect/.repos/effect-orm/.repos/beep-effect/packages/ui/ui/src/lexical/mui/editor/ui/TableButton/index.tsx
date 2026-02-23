import type { FC } from "react";

import type { IToolbarComponentProps } from "../../../common";
import type { ShowModalFn } from "../../hooks/useModal.types";
import { TableIcon } from "../../images/icons";
import { InsertTableDialog } from "../../plugins/TablePlugin";

interface ITableButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ShowModalFn;
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
