"use client";

import type { SettingsState } from "@beep/ui-core/settings";
import { applySettingsToComponents, applySettingsToTheme } from "@beep/ui-core/theme/with-settings";
import type { Components, Theme } from "@mui/material/styles";

import { createTheme as createMuiTheme } from "@mui/material/styles";
import { components } from "./core/components";
import { customShadows } from "./core/custom-shadows";
import { mixins } from "./core/mixins";
import { opacity } from "./core/opacity";
import { palette } from "./core/palette";
import { shadows } from "./core/shadows";
import { typography } from "./core/typography";
import { themeConfig } from "./theme-config";
import type { ThemeOptions } from "./types";

export const baseTheme: ThemeOptions = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light,
      customShadows: customShadows.light,
      opacity,
    },
    dark: {
      palette: palette.dark,
      shadows: shadows.dark,
      customShadows: customShadows.dark,
      opacity,
    },
  },
  mixins,
  components,
  typography,
  shape: { borderRadius: 8 },
  direction: themeConfig.direction,
  cssVariables: themeConfig.cssVariables,
};

type CreateThemeProps = {
  settingsState?: SettingsState;
  themeOverrides?: ThemeOptions;
  localeComponents?: { components?: Components<Theme> };
};

export function createTheme({
  settingsState,
  themeOverrides = {},
  localeComponents = {},
}: CreateThemeProps = {}): Theme {
  // Update core theme settings (colorSchemes, typography, etc.)
  const updatedCore = settingsState ? applySettingsToTheme(baseTheme, settingsState) : baseTheme;

  // Update component settings (only components)
  const updatedComponents = settingsState ? applySettingsToComponents(settingsState) : {};

  return createMuiTheme(updatedCore, updatedComponents, localeComponents, themeOverrides);
}
