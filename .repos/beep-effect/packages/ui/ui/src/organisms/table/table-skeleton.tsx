"use client";

import Skeleton from "@mui/material/Skeleton";
import TableCell from "@mui/material/TableCell";
import type { TableRowProps } from "@mui/material/TableRow";
import TableRow from "@mui/material/TableRow";

type TableSkeletonProps = TableRowProps & {
  rowCount?: number;
  cellCount?: number;
};

export function TableSkeleton({ rowCount = 0, cellCount = 0, ...other }: TableSkeletonProps) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <TableRow key={rowIndex} {...other}>
      {Array.from({ length: cellCount }, (__, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
