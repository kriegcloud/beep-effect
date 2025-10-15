"use client";
import { useTranslate } from "@beep/ui/i18n";
import { createTheme } from "@beep/ui-core/theme/create-theme";
import type {} from "@beep/ui-core/theme/extend-theme-types";
import type { ThemeOptions } from "@beep/ui-core/theme/types";
import { Rtl } from "@beep/ui-core/theme/with-settings";
import CssBaseline from "@mui/material/CssBaseline";
import type { ThemeProviderProps as MuiThemeProviderProps } from "@mui/material/styles";
import { ThemeProvider as ThemeVarsProvider } from "@mui/material/styles";
import { useSettingsContext } from "../settings";
export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: undefined | ThemeOptions;
};

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
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
