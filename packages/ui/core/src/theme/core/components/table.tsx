import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { Components, Theme } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import { tableRowClasses } from "@mui/material/TableRow";

const MuiTableContainer: Components<Theme>["MuiTableContainer"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      position: "relative",
      scrollbarWidth: "thin",
      scrollbarColor: `${rgbaFromChannel(theme.vars.palette.text.disabledChannel, 0.4)} ${rgbaFromChannel(theme.vars.palette.text.disabledChannel, 0.08)}`,
    }),
  },
};

const MuiTableRow: Components<Theme>["MuiTableRow"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      [`&.${tableRowClasses.selected}`]: {
        backgroundColor: rgbaFromChannel(theme.vars.palette.primary.darkChannel, 0.04),
        "&:hover": {
          backgroundColor: rgbaFromChannel(theme.vars.palette.primary.darkChannel, 0.08),
        },
      },
      "&:last-of-type": {
        [`& .${tableCellClasses.root}`]: {
          border: 0,
        },
      },
    }),
  },
};

const MuiTableCell: Components<Theme>["MuiTableCell"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      borderBottomStyle: "dashed",
    },
    head: ({ theme }) => ({
      fontSize: theme.typography.pxToRem(14),
      color: theme.vars.palette.text.secondary,
      fontWeight: theme.typography.fontWeightSemiBold,
      backgroundColor: theme.vars.palette.background.neutral,
    }),
    stickyHeader: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.paper,
      backgroundImage: `linear-gradient(to bottom, ${theme.vars.palette.background.neutral}, ${theme.vars.palette.background.neutral})`,
    }),
    paddingCheckbox: ({ theme }) => ({
      paddingLeft: theme.spacing(1),
    }),
  },
};

const MuiTablePagination: Components<Theme>["MuiTablePagination"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    backIconButtonProps: { size: "small" },
    nextIconButtonProps: { size: "small" },
    slotProps: { select: { name: "table-pagination-select" } },
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: { width: "100%" },
    toolbar: { height: 64 },
    actions: { marginRight: 8 },
    select: {
      display: "flex",
      alignItems: "center",
    },
    selectIcon: {
      right: 4,
      width: 16,
      height: 16,
      top: "calc(50% - 8px)",
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const table: Components<Theme> = {
  MuiTableRow,
  MuiTableCell,
  MuiTableContainer,
  MuiTablePagination,
};
