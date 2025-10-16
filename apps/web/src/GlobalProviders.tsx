"use client";
import { BeepProvider } from "@beep/runtime-client";
import { MotionLazy } from "@beep/ui/animate/motion-lazy";
import { I18nProvider } from "@beep/ui/i18n/i18n.provider";
import { LocalizationProvider } from "@beep/ui/i18n/Localization.provider";
import { Snackbar } from "@beep/ui/molecules";
import { ProgressBar } from "@beep/ui/progress/progress-bar/progress-bar";
import { BreakpointsProvider } from "@beep/ui/providers/break-points.provider";
import { SettingsDrawer, SettingsProvider } from "@beep/ui/settings";
import { ThemeProvider } from "@beep/ui/theme/theme-provider";
import { defaultSettings } from "@beep/ui-core/settings";
import { themeConfig } from "@beep/ui-core/theme";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type React from "react";

import type { AppConfig } from "@/app-config";

type GlobalProviders = {
  children: React.ReactNode;
  nonce: string | undefined;
  appConfig: AppConfig;
};

export function GlobalProviders({ children, appConfig, nonce }: GlobalProviders) {
  return (
    <BeepProvider>
      <InitColorSchemeScript
        nonce={nonce}
        modeStorageKey={themeConfig.modeStorageKey}
        attribute={themeConfig.cssVariables.colorSchemeSelector}
        defaultMode={themeConfig.defaultMode}
      />
      <I18nProvider lang={appConfig.i18nLang}>
        <SettingsProvider cookieSettings={appConfig.cookieSettings} defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <AppRouterCacheProvider options={{ key: "css", enableCssLayer: true, nonce }}>
              <ThemeProvider modeStorageKey={themeConfig.modeStorageKey} defaultMode={themeConfig.defaultMode}>
                <BreakpointsProvider>
                  <MotionLazy>
                    <Snackbar />
                    <ProgressBar />
                    <SettingsDrawer defaultSettings={defaultSettings} />
                    {children}
                  </MotionLazy>
                </BreakpointsProvider>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </I18nProvider>
    </BeepProvider>
  );
}
