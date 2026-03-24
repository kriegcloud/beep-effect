import type { createTheme } from "@mui/material/styles";

/**
 * @since 0.0.0
 */
export type ThemeOptions = NonNullable<Parameters<typeof createTheme>[0]>;

/**
 * @since 0.0.0
 */
export type ThemeComponents = NonNullable<Parameters<typeof createTheme>[0]>["components"];
