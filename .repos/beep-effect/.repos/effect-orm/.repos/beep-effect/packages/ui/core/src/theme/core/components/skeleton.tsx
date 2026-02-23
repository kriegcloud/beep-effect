import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { Components, Theme } from "@mui/material/styles";

const MuiSkeleton: Components<Theme>["MuiSkeleton"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    animation: "wave",
    variant: "rounded",
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: rgbaFromChannel(theme.vars.palette.grey["400Channel"], 0.12),
    }),
    rounded: ({ theme }) => ({
      borderRadius: Number(theme.shape.borderRadius) * 2,
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const skeleton: Components<Theme> = {
  MuiSkeleton,
};
