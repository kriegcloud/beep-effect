import type { ThemeComponents } from "../types.ts";

/**
 * @since 0.0.0
 */
export const alertTheme: ThemeComponents = {
  MuiAlert: {
    styleOverrides: {
      root: {
        "--Icon-color": "currentColor",
      },
    },
  },
};
