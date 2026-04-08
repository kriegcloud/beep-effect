import type { createTheme } from "@mui/material/styles";

/**
 * Theme option shape derived from MUI.
 *
 * @since 0.0.0
 * @category types
 */
export type ThemeOptions = NonNullable<Parameters<typeof createTheme>[0]>;

/**
 * Theme component slots derived from MUI.
 *
 * @since 0.0.0
 * @category types
 */
export type ThemeComponents = NonNullable<Parameters<typeof createTheme>[0]>["components"];
