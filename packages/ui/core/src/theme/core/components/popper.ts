import type { Theme } from "@mui/material";
import type { Components } from "@mui/material/styles";

const MuiPopper: Components<Theme>["MuiPopper"] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      zIndex: theme.zIndex.tooltip,
    }),
  },
};

export const popper: Components<Theme> = {
  MuiPopper,
};
