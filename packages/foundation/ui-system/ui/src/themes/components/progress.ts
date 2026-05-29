import type { ThemeComponents } from "../types.ts";

/**
 * Progress theme theme value.
 *
 * @example
 * ```ts
 * import { progressTheme } from "@beep/ui/themes/components/progress"
 *
 * console.log(progressTheme)
 * ```
 *
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
