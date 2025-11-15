"use client";

import type { BoxProps } from "@mui/material/Box";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

export type TableSelectedActionProps = BoxProps & {
  dense?: boolean;
  rowCount: number;
  numSelected: number;
  action?: React.ReactNode;
  onSelectAllRows: (checked: boolean) => void;
};

export function TableSelectedAction({
  sx,
  dense,
  action,
  rowCount,
  numSelected,
  onSelectAllRows,
  ...other
}: TableSelectedActionProps) {
  if (!numSelected) {
    return null;
  }

  return (
    <Box
      sx={[
        () => ({
          pl: 1,
          pr: 2,
          top: 0,
          left: 0,
          width: 1,
          zIndex: 9,
          height: 58,
          display: "flex",
          position: "absolute",
          alignItems: "center",
          bgcolor: "primary.lighter",
          ...(dense && { height: 38 }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Checkbox
        indeterminate={!!numSelected && numSelected < rowCount}
        checked={!!rowCount && numSelected === rowCount}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSelectAllRows(event.target.checked)}
        slotProps={{
          input: {
            id: "deselect-all-checkbox",
            "aria-label": "Deselect all checkbox",
          },
        }}
      />

      <Typography
        variant="subtitle2"
        sx={{
          ml: 2,
          flexGrow: 1,
          color: "primary.main",
          ...(dense && { ml: 3 }),
        }}
      >
        {numSelected} selected
      </Typography>

      {action && action}
    </Box>
  );
}
