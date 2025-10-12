import { listItemIconClasses } from "@mui/material";
import type { Components, Theme } from "@mui/material/styles";

const MuiMenuItem: Components<Theme>["MuiMenuItem"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  defaultProps: { dense: true },
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.mixins.menuItemStyles(theme),
      "&:hover": {
        backgroundColor: theme.vars.palette.background.menuElevation1,
      },
      padding: "8px 16px",
      [`& .${listItemIconClasses.root}`]: {
        minWidth: 24,
        "& svg": {
          fontSize: 16,
        },
      },
    }),
    dense: {
      padding: "6px 16px",
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const menu: Components<Theme> = {
  MuiMenuItem,
};
