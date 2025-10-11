import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { Components, Theme } from "@mui/material/styles";

const MuiDrawer: Components<Theme>["MuiDrawer"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    paper: {
      variants: [
        {
          props: (props) => props.variant === "temporary" && props.anchor === "left",
          style: ({ theme }) => ({
            ...theme.mixins.paperStyles(theme),
            boxShadow: `40px 40px 80px -8px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.24)}`,
            ...theme.applyStyles("dark", {
              boxShadow: `40px 40px 80px -8px  ${rgbaFromChannel(theme.vars.palette.common.blackChannel, 0.24)}`,
            }),
          }),
        },
        {
          props: (props) => props.variant === "temporary" && props.anchor === "right",
          style: ({ theme }) => ({
            ...theme.mixins.paperStyles(theme),
            boxShadow: `-40px 40px 80px -8px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.24)}`,
            ...theme.applyStyles("dark", {
              boxShadow: `-40px 40px 80px -8px ${rgbaFromChannel(theme.vars.palette.common.blackChannel, 0.24)}`,
            }),
          }),
        },
      ],
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const drawer: Components<Theme> = {
  MuiDrawer,
};
