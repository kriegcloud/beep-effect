/**
 * The theme provider module.
 *
 * @module @beep/ui/themes/theme-provider
 * @since 0.0.0
 */
"use client";

import { $UiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider, useColorScheme } from "@mui/material/styles";
import * as Bool from "effect/Boolean";
import type * as React from "react";
import { theme } from "./theme.ts";

const $I = $UiId.create("themes/theme-provider");
/**
 * The mode of the theme.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const ThemeMode = LiteralKit(["light", "dark", "system"]).pipe(
  $I.annoteSchema("ThemeMode", {
    description: "The mode of the theme.",
  })
);

/**
 * Type of {@link ThemeMode}.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type ThemeMode = typeof ThemeMode.Type;

/**
 * The resolved mode of the theme, excluding 'system'.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const ResolvedThemeMode = LiteralKit(ThemeMode.omitOptions(["system"])).pipe(
  $I.annoteSchema("ResolvedThemeMode", {
    description: "The resolved mode of the theme, excluding 'system'.",
  })
);

/**
 * Type of {@link ResolvedThemeMode}.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type ResolvedThemeMode = typeof ResolvedThemeMode.Type;

interface AppThemeProviderProps {
  readonly children: React.ReactNode;
  readonly defaultMode?: undefined | ThemeMode;
}

interface ThemeModeControls {
  readonly mode: ThemeMode;
  readonly resolvedMode: ResolvedThemeMode;
  readonly setMode: (mode: ThemeMode | null) => void;
  readonly toggleMode: () => void;
}

/**
 * Resolves the active theme mode from user and system preferences.
 *
 * @since 0.0.0
 * @category utilities
 */
export const resolveThemeMode = (
  mode: ThemeMode | null | undefined,
  systemMode: ThemeMode | null | undefined
): ResolvedThemeMode => {
  const prefersDarkMode = ThemeMode.is.dark(mode) || (!ThemeMode.is.light(mode) && ThemeMode.is.dark(systemMode));

  return Bool.match(prefersDarkMode, {
    onTrue: () => ThemeMode.Enum.dark,
    onFalse: () => ThemeMode.Enum.light,
  });
};

/**
 * Provides the shared app theme and color-scheme baseline.
 *
 * @since 0.0.0
 * @category components
 */
export function AppThemeProvider({ children, defaultMode = ThemeMode.Enum.system }: AppThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme} defaultMode={defaultMode} disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}

/**
 * Exposes the current theme mode controls.
 *
 * @since 0.0.0
 * @category hooks
 */
export function useThemeMode(): ThemeModeControls {
  const { mode, setMode, systemMode } = useColorScheme();
  const resolvedMode = resolveThemeMode(mode, systemMode);

  return {
    mode: mode ?? ThemeMode.Enum.system,
    resolvedMode,
    setMode,
    toggleMode: () => setMode(ThemeMode.is.dark(resolvedMode) ? ThemeMode.Enum.light : ThemeMode.Enum.dark),
  };
}
