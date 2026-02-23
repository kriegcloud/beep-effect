"use client";

import { EmptyContent } from "@beep/ui/molecules";
import type { SxProps, Theme } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export type TableNoDataProps = {
  notFound: boolean;
  sx?: SxProps<Theme>;
};

export function TableNoData({ notFound, sx }: TableNoDataProps) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent filled sx={[{ py: 10 }, ...(Array.isArray(sx) ? sx : [sx])]} />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
