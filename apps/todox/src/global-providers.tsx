"use client";

import { CSPProvider } from "@base-ui/react/csp-provider";
import { BeepProvider } from "@beep/runtime-client";
import RecaptchaV3Atom from "@beep/shared-client/services/react-recaptcha-v3/recaptcha-v3-atom";
import type { AppConfig } from "@beep/todox/app-config";
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
import type React from "react";

type GlobalProviders = {
  readonly children: React.ReactNode;
  readonly appConfig: AppConfig;
};

export function GlobalProviders({ children, appConfig }: GlobalProviders) {
  return (
    <BeepProvider>
      <CSPProvider>
        <I18nProvider lang={appConfig.i18nLang}>
          {/*{isDev && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}*/}
          <SettingsProvider cookieSettings={appConfig.cookieSettings} defaultSettings={defaultSettings}>
            <LocalizationProvider>
              <ThemeProvider modeStorageKey={themeConfig.modeStorageKey} defaultMode={themeConfig.defaultMode}>
                <RecaptchaV3Atom>
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
                </RecaptchaV3Atom>
              </ThemeProvider>
            </LocalizationProvider>
          </SettingsProvider>
        </I18nProvider>
      </CSPProvider>
    </BeepProvider>
  );
}
