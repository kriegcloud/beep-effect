"use client";

import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TablePaginationProps } from "@mui/material/TablePagination";
import TablePagination from "@mui/material/TablePagination";

export type TablePaginationCustomProps = TablePaginationProps & {
  dense?: boolean;
  sx?: SxProps<Theme>;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TablePaginationCustom({
  sx,
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  ...other
}: TablePaginationCustomProps) {
  return (
    <Box sx={[{ position: "relative" }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        {...other}
        sx={{ borderTopColor: "transparent" }}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={
            <Switch checked={Boolean(dense)} onChange={onChangeDense} slotProps={{ input: { id: "dense-switch" } }} />
          }
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: { sm: "absolute" },
          }}
        />
      )}
    </Box>
  );
}
