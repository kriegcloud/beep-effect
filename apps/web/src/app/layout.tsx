import "@beep/ui/globals.css";
import { MotionLazy } from "@beep/ui/animate/motion-lazy";
import { Snackbar } from "@beep/ui/molecules";
import { ProgressBar } from "@beep/ui/progress/progress-bar/progress-bar";
import { defaultSettings, SettingsDrawer, SettingsProvider } from "@beep/ui/settings";
import { detectSettings } from "@beep/ui/settings/server";
import { primary, themeConfig } from "@beep/ui/theme";
import { ThemeProvider } from "@beep/ui/theme/theme-provider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata, Viewport } from "next";
import type React from "react";
// import { GlobalProviders } from "@/global-providers";
import "dayjs/locale/en";
import "dayjs/locale/vi";
import "dayjs/locale/fr";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ar-sa";
import { I18nProvider } from "@beep/ui/i18n/i18n.provider";
import { LocalizationProvider } from "@beep/ui/i18n/Localization.provider";
import { detectLanguage } from "@beep/ui/i18n/server";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata: Metadata = {
  manifest: "/site.webmanifest",
  icons: [
    {
      rel: "icon",
      url: `/favicon.ico`,
    },
  ],
};

type RootLayoutProps = {
  children: React.ReactNode;
};

async function getAppConfig() {
  const [lang, settings] = await Promise.all([detectLanguage(), detectSettings()]);

  return {
    lang,
    i18nLang: lang,
    cookieSettings: settings,
    dir: settings.direction,
  };
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const appConfig = await getAppConfig();

  return (
    <html lang={appConfig.lang ?? "en"} dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.defaultMode}
        />
        <I18nProvider lang={appConfig.i18nLang}>
          {/*<GlobalProviders>*/}
          <SettingsProvider cookieSettings={appConfig.cookieSettings} defaultSettings={defaultSettings}>
            <LocalizationProvider>
              <AppRouterCacheProvider options={{ key: "css", enableCssLayer: true }}>
                <ThemeProvider modeStorageKey={themeConfig.modeStorageKey} defaultMode={themeConfig.defaultMode}>
                  <MotionLazy>
                    <Snackbar />
                    <ProgressBar />
                    <SettingsDrawer defaultSettings={defaultSettings} />
                    {children}
                  </MotionLazy>
                </ThemeProvider>
              </AppRouterCacheProvider>
            </LocalizationProvider>
          </SettingsProvider>
          {/*</GlobalProviders>*/}
        </I18nProvider>
      </body>
    </html>
  );
}
