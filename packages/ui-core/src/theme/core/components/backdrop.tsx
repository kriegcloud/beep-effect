import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { Components, Theme } from "@mui/material/styles";

const MuiBackdrop: Components<Theme>["MuiBackdrop"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      variants: [
        {
          props: (props) => !props.invisible,
          style: {
            backgroundColor: rgbaFromChannel(theme.vars.palette.grey["800Channel"], 0.48),
          },
        },
      ],
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const backdrop: Components<Theme> = {
  MuiBackdrop,
};
