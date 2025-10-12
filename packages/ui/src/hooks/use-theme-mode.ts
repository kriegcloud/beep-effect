"use client";

import type { ThemeMode } from "@beep/ui-core/settings";
import { useColorScheme } from "@mui/material";
import { useCallback } from "react";

export const useThemeMode = () => {
  const { mode, systemMode, setMode } = useColorScheme();

  const isDark = mode === "system" ? systemMode === "dark" : mode === "dark";

  const setThemeMode = useCallback(
    (themeMode?: ThemeMode.Type) => {
      setMode(themeMode ?? (isDark ? "light" : "dark"));
    },
    [setMode, systemMode, mode]
  );

  const resetTheme = useCallback(() => {
    setMode(null);
  }, [setMode]);

  return { mode, resetTheme, isDark, systemMode, setThemeMode };
};
