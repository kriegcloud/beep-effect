import {
  withThemeByDataAttribute,
  withThemeFromJSXProvider,
} from "@storybook/addon-themes";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { createTheme } from "@beep/ui-core/theme/create-theme";
import { defaultSettings } from "@beep/ui-core/settings/settings-config";
import type { SettingsState } from "@beep/ui-core/settings/types";
import type { ReactNode } from "react";

// Emotion cache for style insertion order
const emotionCache = createCache({ key: "mui", prepend: true });

// Pre-create themes
const createThemeForMode = (mode: "light" | "dark") => {
  const settingsState: SettingsState = { ...defaultSettings, mode };
  return createTheme({ settingsState });
};

const lightTheme = createThemeForMode("light");
const darkTheme = createThemeForMode("dark");

// Custom provider component
interface StorybookThemeProviderProps {
  children: ReactNode;
  theme: ReturnType<typeof createTheme>;
}

const StorybookThemeProvider = ({ children, theme }: StorybookThemeProviderProps) => (
  <CacheProvider value={emotionCache}>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  </CacheProvider>
);

// CRITICAL: Use withThemeByDataAttribute, NOT withThemeByClassName
export const themeDataAttributeDecorator = withThemeByDataAttribute({
  themes: { light: "light", dark: "dark" },
  defaultTheme: "dark",
  attributeName: "data-color-scheme",  // MUST be data-color-scheme
});

export const themeProviderDecorator = withThemeFromJSXProvider({
  themes: { light: lightTheme, dark: darkTheme },
  defaultTheme: "dark",
  Provider: StorybookThemeProvider,
});
