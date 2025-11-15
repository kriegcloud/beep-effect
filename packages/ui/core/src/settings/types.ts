import type { ThemeConfig } from "@beep/ui-core/theme/theme-config";
import type { ThemeColorPreset } from "@beep/ui-core/theme/with-settings";
import type { SxProps, Theme } from "@mui/material/styles";

export type SettingsState = {
  readonly version: string;
  readonly fontSize: number;
  readonly fontFamily: string;
  readonly compactLayout: boolean;
  readonly contrast: "default" | "high";
  readonly primaryColor: ThemeColorPreset;
  readonly mode: ThemeConfig["defaultMode"];
  readonly navColor: "integrate" | "apparent";
  readonly direction: ThemeConfig["direction"];
  readonly navLayout: "vertical" | "horizontal" | "mini";
};

export type SettingsContextValue = {
  readonly state: SettingsState;
  readonly isDarkMode: boolean;
  readonly canReset: boolean;
  readonly onReset: () => void;
  readonly setState: (updateValue: Partial<SettingsState>) => void;
  readonly setField: (name: keyof SettingsState, updateValue: SettingsState[keyof SettingsState]) => void;
  // Drawer
  readonly openDrawer: boolean;
  readonly onCloseDrawer: () => void;
  readonly onToggleDrawer: () => void;
};

export type SettingsProviderProps = {
  readonly cookieSettings?: SettingsState | undefined;
  readonly defaultSettings: SettingsState;
  readonly children: React.ReactNode;
  readonly storageKey?: string | undefined;
};

export type SettingsDrawerProps = {
  readonly sx?: SxProps<Theme> | undefined;
  readonly defaultSettings: SettingsState;
};
