"use client";

import {IamProvider} from "@beep/iam-ui/IamProvider";
import {BeepProvider} from "@beep/runtime-client";
import {MotionLazy} from "@beep/ui/animate/motion-lazy";
import {I18nProvider} from "@beep/ui/i18n/i18n.provider";
import {LocalizationProvider} from "@beep/ui/i18n/Localization.provider";
import {Snackbar} from "@beep/ui/molecules";
import {ConfirmProvider} from "@beep/ui/organisms";
import {ProgressBar} from "@beep/ui/progress/progress-bar/progress-bar";
import {BreakpointsProvider} from "@beep/ui/providers/break-points.provider";
import {SettingsDrawer, SettingsProvider} from "@beep/ui/settings";
import {ThemeProvider} from "@beep/ui/theme/theme-provider";
import {defaultSettings} from "@beep/ui-core/settings";
import {themeConfig} from "@beep/ui-core/theme";
import {TanStackDevtools} from "@tanstack/react-devtools";
import {formDevtoolsPlugin} from "@tanstack/react-form-devtools";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";

import type React from "react";
import type {AppConfig} from "@beep/todox/app-config";

import {EnvValue} from "@beep/constants";
import {clientEnv} from "@beep/shared-env/ClientEnv";
import {themeOverrides} from "@beep/todox/theme";

type GlobalProviders = {
  readonly children: React.ReactNode;
  readonly appConfig: AppConfig;
};
const isDev = EnvValue.is.dev(clientEnv.env);

export function GlobalProviders({children, appConfig}: GlobalProviders) {


  return (
    <BeepProvider>
      <InitColorSchemeScript
        modeStorageKey={themeConfig.modeStorageKey}
        attribute={"class"}
        defaultMode={themeConfig.defaultMode}
      />
      <I18nProvider lang={appConfig.i18nLang}>
        {isDev && <TanStackDevtools plugins={[formDevtoolsPlugin()]}/>}
        <SettingsProvider cookieSettings={appConfig.cookieSettings} defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <AppRouterCacheProvider options={{enableCssLayer: true}}>
              <ThemeProvider themeOverrides={themeOverrides} modeStorageKey={themeConfig.modeStorageKey} defaultMode={themeConfig.defaultMode} >
                <BreakpointsProvider>
                  <ConfirmProvider>
                    <IamProvider>
                      <MotionLazy>
                        <Snackbar/>
                        <ProgressBar/>
                        <SettingsDrawer defaultSettings={defaultSettings}/>
                        {children}
                      </MotionLazy>
                    </IamProvider>
                  </ConfirmProvider>
                </BreakpointsProvider>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </I18nProvider>
    </BeepProvider>
  );
}
