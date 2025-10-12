import { listClasses } from "@mui/material/List";
import type { Components, Theme } from "@mui/material/styles";

const MuiPopover: Components<Theme>["MuiPopover"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  defaultProps: {
    slotProps: {
      paper: {
        variant: "elevation",
        elevation: 6,
      },
    },
  },
  styleOverrides: {
    paper: ({ theme }) => ({
      ...theme.mixins.paperStyles(theme, { dropdown: true }),
      [`& .${listClasses.root}`]: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const popover: Components<Theme> = {
  MuiPopover,
};
