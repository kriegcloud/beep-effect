"use client";

import type { AccountSettingsTabSearchParamValue } from "@beep/iam-domain";
import { BeepProvider } from "@beep/runtime-client";
import { MotionLazy } from "@beep/ui/animate/motion-lazy";
import { I18nProvider } from "@beep/ui/i18n/i18n.provider";
import { LocalizationProvider } from "@beep/ui/i18n/localization.provider";
import { Snackbar } from "@beep/ui/molecules";
import { ConfirmProvider } from "@beep/ui/organisms";
import { ProgressBar } from "@beep/ui/progress/progress-bar/progress-bar";
import { BreakpointsProvider } from "@beep/ui/providers/break-points.provider";
import { SettingsDrawer, SettingsProvider } from "@beep/ui/settings";
import { ThemeProvider } from "@beep/ui/theme/theme-provider";
import { defaultSettings } from "@beep/ui-core/settings";
import { themeConfig } from "@beep/ui-core/theme";
import { Registry, RegistryContext } from "@effect-atom/atom-react";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import * as O from "effect/Option";
import type React from "react";
import type { AppConfig } from "@/app-config";
import { settingsDialogAtom } from "@/global.atoms";
import { DevToolsProvider } from "@/providers/DevToolsProvider";

type GlobalProviders = {
  readonly children: React.ReactNode;
  readonly appConfig: AppConfig;
};

export function GlobalProviders({ children, appConfig }: GlobalProviders) {
  const registry = Registry.make({
    initialValues: [[settingsDialogAtom.remoteAtom, O.none<AccountSettingsTabSearchParamValue.Type>()]],
  });

  return (
    <BeepProvider>
      <RegistryContext.Provider value={registry}>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.defaultMode}
        />
        <I18nProvider lang={appConfig.i18nLang}>
          <DevToolsProvider>
            <SettingsProvider cookieSettings={appConfig.cookieSettings} defaultSettings={defaultSettings}>
              <LocalizationProvider>
                <AppRouterCacheProvider options={{ key: "css", enableCssLayer: true }}>
                  <ThemeProvider modeStorageKey={themeConfig.modeStorageKey} defaultMode={themeConfig.defaultMode}>
                    <BreakpointsProvider>
                      <ConfirmProvider>
                        <MotionLazy>
                          <Snackbar />
                          <ProgressBar />
                          <SettingsDrawer defaultSettings={defaultSettings} />
                          {children}
                        </MotionLazy>
                      </ConfirmProvider>
                    </BreakpointsProvider>
                  </ThemeProvider>
                </AppRouterCacheProvider>
              </LocalizationProvider>
            </SettingsProvider>
          </DevToolsProvider>
        </I18nProvider>
      </RegistryContext.Provider>
    </BeepProvider>
  );
}
