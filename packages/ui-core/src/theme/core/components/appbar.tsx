import type { Components, Theme } from "@mui/material/styles";

const MuiAppBar: Components<Theme>["MuiAppBar"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    color: "inherit",
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: { boxShadow: "none" },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const appBar: Components<Theme> = {
  MuiAppBar,
};
