import { themeConfig } from "@beep/ui-core/theme/theme-config";
import type { SettingsState } from "./types";

export const SETTINGS_STORAGE_KEY: string = "app-settings";

export const defaultSettings: SettingsState = {
  mode: themeConfig.defaultMode,
  direction: themeConfig.direction,
  contrast: "default",
  navLayout: "vertical",
  primaryColor: "default",
  navColor: "integrate",
  compactLayout: true,
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.primary,
  version: "1.0.0",
};
