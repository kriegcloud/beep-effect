import "@beep/ui/globals.css";
import { primary } from "@beep/ui/theme";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import type React from "react";
import "dayjs/locale/en";
import "dayjs/locale/vi";
import "dayjs/locale/fr";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ar-sa";
import { getAppConfig } from "@/app-config";
import { GlobalProviders } from "@/GlobalProviders";

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

export default async function RootLayout({ children }: RootLayoutProps) {
  const appConfig = await getAppConfig();
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <html lang={appConfig.lang ?? "en"} dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <GlobalProviders appConfig={appConfig} nonce={nonce}>
          {children}
        </GlobalProviders>
      </body>
    </html>
  );
}
