"use client";
import { IamProvider } from "@beep/iam-ui/IamProvider";
import { BeepProvider } from "@beep/runtime-client";
import type { AppConfig } from "@beep/todox/app-config";
import { themeOverrides } from "@beep/todox/theme";
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
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
// import { TanStackDevtools } from "@tanstack/react-devtools";
// import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import React from "react";

// Handler for unhandled promise rejections
// Suppresses known harmless "Timeout" rejections from third-party scripts (e.g., Google Identity Services)
// while logging other unhandled rejections for debugging
const useUnhandledRejectionHandler = () => {
  React.useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;

      // Suppress bare "Timeout" string rejections from third-party scripts
      // These come from Google Identity Services (One Tap) and similar external libraries
      // and don't indicate actual application errors
      if (reason === "Timeout" && typeof reason === "string") {
        event.preventDefault();
        return;
      }

      // Log other unhandled rejections for debugging
      console.error("[UnhandledRejection]", {
        reason,
        type: typeof reason,
        constructor: reason?.constructor?.name,
        name: reason?.name,
        message: reason?.message,
        stack: reason?.stack,
        _tag: reason?._tag,
        cause: reason?.cause,
      });
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);
};

type GlobalProviders = {
  readonly children: React.ReactNode;
  readonly appConfig: AppConfig;
};

export function GlobalProviders({ children, appConfig }: GlobalProviders) {
  useUnhandledRejectionHandler();

  return (
    <BeepProvider>
      <InitColorSchemeScript
        modeStorageKey={themeConfig.modeStorageKey}
        attribute={"class"}
        defaultMode={themeConfig.defaultMode}
      />
      <I18nProvider lang={appConfig.i18nLang}>
        {/*{isDev && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}*/}
        <SettingsProvider cookieSettings={appConfig.cookieSettings} defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <ThemeProvider
                themeOverrides={themeOverrides}
                modeStorageKey={themeConfig.modeStorageKey}
                defaultMode={themeConfig.defaultMode}
              >
                <BreakpointsProvider>
                  <ConfirmProvider>
                    <IamProvider>
                      <MotionLazy>
                        <Snackbar />
                        <ProgressBar />
                        <SettingsDrawer defaultSettings={defaultSettings} />
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
