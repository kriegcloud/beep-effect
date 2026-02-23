"use client";

import TableCell from "@mui/material/TableCell";
import type { TableRowProps } from "@mui/material/TableRow";
import TableRow from "@mui/material/TableRow";

export type TableEmptyRowsProps = TableRowProps & {
  height?: number;
  emptyRows: number;
};

export function TableEmptyRows({ emptyRows, height, sx, ...other }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={[
        () => ({
          ...(height && { height: height * emptyRows }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <TableCell colSpan={9} />
    </TableRow>
  );
}
