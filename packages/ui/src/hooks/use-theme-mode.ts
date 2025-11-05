"use client";

import type { SettingsState } from "@beep/ui-core/settings";
import { useColorScheme } from "@mui/material";
import { useCallback } from "react";
import { useSettingsContext } from "../settings";

export const useThemeMode = () => {
  const { mode, systemMode, setMode } = useColorScheme();
  const settings = useSettingsContext();

  const isDark = mode === "system" ? systemMode === "dark" : mode === "dark";

  const setThemeMode = useCallback(
    (themeMode?: SettingsState["mode"] | undefined) => {
      settings.setState({
        mode: themeMode ?? (isDark ? "light" : "dark"),
      });
    },
    [setMode, systemMode, mode]
  );

  const resetTheme = useCallback(() => {
    settings.onReset();
    setMode(null);
  }, [setMode]);

  return { mode, resetTheme, isDark, systemMode, setThemeMode };
};
