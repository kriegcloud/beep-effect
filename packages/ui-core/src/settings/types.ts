import type { ThemeConfig } from "@beep/ui-core/theme/theme-config";
import type { ThemeColorPreset } from "@beep/ui-core/theme/with-settings";
import type { SxProps, Theme } from "@mui/material/styles";

export type SettingsState = {
  version: string;
  fontSize: number;
  fontFamily: string;
  compactLayout: boolean;
  contrast: "default" | "high";
  primaryColor: ThemeColorPreset;
  mode: ThemeConfig["defaultMode"];
  navColor: "integrate" | "apparent";
  direction: ThemeConfig["direction"];
  navLayout: "vertical" | "horizontal" | "mini";
};

export type SettingsContextValue = {
  state: SettingsState;
  isDarkMode: boolean;
  canReset: boolean;
  onReset: () => void;
  setState: (updateValue: Partial<SettingsState>) => void;
  setField: (name: keyof SettingsState, updateValue: SettingsState[keyof SettingsState]) => void;
  // Drawer
  openDrawer: boolean;
  onCloseDrawer: () => void;
  onToggleDrawer: () => void;
};

export type SettingsProviderProps = {
  cookieSettings?: SettingsState;
  defaultSettings: SettingsState;
  children: React.ReactNode;
  storageKey?: string;
};

export type SettingsDrawerProps = {
  sx?: SxProps<Theme>;
  defaultSettings: SettingsState;
};
