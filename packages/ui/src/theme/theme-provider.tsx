"use client";
import { useTranslate } from "@beep/ui/i18n";
import CssBaseline from "@mui/material/CssBaseline";
import type { ThemeProviderProps as MuiThemeProviderProps } from "@mui/material/styles";
import { ThemeProvider as ThemeVarsProvider } from "@mui/material/styles";
import { useSettingsContext } from "../settings";
import { createTheme } from "./create-theme";
import type {} from "./extend-theme-types";
import type { ThemeOptions } from "./types";
import { Rtl } from "./with-settings";
export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: undefined | ThemeOptions;
};

export function ThemeProvider({
  themeOverrides,
  children,
  ...other
}: ThemeProviderProps) {
  const settings = useSettingsContext();
  const { currentLang } = useTranslate();

  const theme = createTheme({
    settingsState: settings.state,
    localeComponents: currentLang?.systemValue,
    themeOverrides,
  });

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      <CssBaseline />
      <Rtl direction={settings.state.direction ?? "ltr"}>{children}</Rtl>
    </ThemeVarsProvider>
  );
}
