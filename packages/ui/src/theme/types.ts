import type {
  ColorSystemOptions,
  Components,
  CssVarsThemeOptions,
  ThemeOptions as MuiThemeOptions,
  Shadows,
  SupportedColorScheme,
  Theme,
} from "@mui/material/styles";
import type { CustomShadows } from "./core/custom-shadows";

/**
 * Theme options
 * Extended type that includes additional properties for color schemes and CSS variables.
 *
 * @see https://github.com/mui/material-ui/blob/master/packages/mui-material/src/styles/createTheme.ts
 */

export type ThemeColorScheme = SupportedColorScheme;
export type ThemeCssVariables = Pick<
  CssVarsThemeOptions,
  "cssVarPrefix" | "rootSelector" | "colorSchemeSelector" | "disableCssColorScheme" | "shouldSkipGeneratingVar"
>;

export type ColorSchemeOptionsExtended = ColorSystemOptions & {
  shadows?: Partial<Shadows>;
  customShadows?: Partial<CustomShadows>;
};

export type SchemesRecord<T> = Partial<Record<ThemeColorScheme, T>>;

export type ThemeOptions = Omit<MuiThemeOptions, "components"> &
  Pick<CssVarsThemeOptions, "defaultColorScheme"> & {
    colorSchemes?: SchemesRecord<ColorSchemeOptionsExtended>;
    cssVariables?: ThemeCssVariables;
    components?: Components<Theme>;
  };
