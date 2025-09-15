import type { Components, Theme } from "@mui/material/styles";

const MuiLink: Components<Theme>["MuiLink"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    underline: "hover",
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const link: Components<Theme> = {
  MuiLink,
};
