import type { ThemeComponents } from "../types.ts";

export const alertTheme: ThemeComponents = {
  MuiAlert: {
    styleOverrides: {
      root: {
        "--Icon-color": "currentColor",
      },
    },
  },
};
