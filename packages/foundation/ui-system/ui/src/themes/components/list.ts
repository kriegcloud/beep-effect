import type { ThemeComponents } from "../types.ts";

/**
 * @category themes
 * @since 0.0.0
 */
export const listTheme: ThemeComponents = {
  MuiListItemAvatar: {
    styleOverrides: {
      root: {
        minWidth: "unset",
      },
    },
  },
};
