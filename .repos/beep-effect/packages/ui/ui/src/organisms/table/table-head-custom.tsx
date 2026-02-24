import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";

const visuallyHidden: CSSObject = {
  border: 0,
  padding: 0,
  width: "1px",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
};

export type TableHeadCellProps = {
  id: string;
  label?: string;
  width?: CSSObject["width"];
  align?: "left" | "center" | "right";
  sx?: SxProps<Theme>;
};

export type TableHeadCustomProps = {
  orderBy?: string;
  rowCount?: number;
  sx?: SxProps<Theme>;
  numSelected?: number;
  order?: "asc" | "desc";
  headCells: TableHeadCellProps[];
  onSort?: (id: string) => void;
  onSelectAllRows?: (checked: boolean) => void;
};

export function TableHeadCustom({
  sx,
  order,
  onSort,
  orderBy,
  headCells,
  rowCount = 0,
  numSelected = 0,
  onSelectAllRows,
}: TableHeadCustomProps) {
  return (
    <TableHead sx={sx ?? {}}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSelectAllRows(event.target.checked)}
              slotProps={{
                input: {
                  id: `all-row-checkbox`,
                  "aria-label": `All row Checkbox`,
                },
              }}
            />
          </TableCell>
        )}

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || "left"}
            sortDirection={orderBy === headCell.id && order ? order : "asc"}
            sx={[
              { width: headCell.width ?? "auto" },
              ...(Array.isArray(headCell.sx) ? headCell.sx : [headCell.sx ?? {}]),
            ]}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id && order ? order : "asc"}
                onClick={() => onSort(headCell.id)}
              >
                {headCell.label}

                {orderBy === headCell.id ? (
                  <Box component="span" sx={(visuallyHidden as SxProps<Theme>) ?? {}}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
