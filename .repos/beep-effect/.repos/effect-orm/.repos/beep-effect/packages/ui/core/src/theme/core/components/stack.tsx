import type { Components, Theme } from "@mui/material/styles";

const MuiStack: Components<Theme>["MuiStack"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    useFlexGap: true,
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const stack: Components<Theme> = {
  MuiStack,
};
