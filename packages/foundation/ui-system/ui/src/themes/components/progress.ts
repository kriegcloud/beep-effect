import type { ThemeComponents } from "../types.ts";

/**
 * @category themes
 * @since 0.0.0
 */
export const progressTheme: ThemeComponents = {
  MuiCircularProgress: {
    styleOverrides: {
      circle: {
        strokeLinecap: "round",
      },
    },
  },
};
