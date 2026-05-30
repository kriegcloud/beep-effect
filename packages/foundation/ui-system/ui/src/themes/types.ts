import type { createTheme } from "@mui/material/styles";

/**
 * Theme options type.
 *
 * @example
 * ```ts
 * import type { ThemeOptions } from "@beep/ui/themes/types"
 *
 * const value = {} as ThemeOptions
 * console.log(value)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ThemeOptions = NonNullable<Parameters<typeof createTheme>[0]>;

/**
 * Theme components type.
 *
 * @example
 * ```ts
 * import type { ThemeComponents } from "@beep/ui/themes/types"
 *
 * const value = {} as ThemeComponents
 * console.log(value)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ThemeComponents = NonNullable<Parameters<typeof createTheme>[0]>["components"];
