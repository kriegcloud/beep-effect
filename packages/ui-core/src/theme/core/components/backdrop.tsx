import { cssVarRgba, rgbaFromChannel } from "@beep/ui-core/utils";
import type { Components, Theme } from "@mui/material/styles";

const MuiBackdrop: Components<Theme>["MuiBackdrop"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      if (ownerState.invisible) {
        return {};
      }
      return {
        backgroundColor: cssVarRgba(theme.vars.palette.grey["950Channel"], 0.3),
        ...theme.applyStyles("dark", {
          backgroundColor: cssVarRgba(theme.vars.palette.grey["950Channel"], 0.5),
        }),
        variants: [
          {
            props: (props) => !props.invisible,
            style: {
              backgroundColor: rgbaFromChannel(theme.vars.palette.grey["800Channel"], 0.48),
            },
          },
        ],
      };
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const backdrop: Components<Theme> = {
  MuiBackdrop,
};
