import "@beep/ui/globals.css";
import { KaServices } from "@beep/runtime-client";
import { runServerPromise } from "@beep/runtime-server";
import { primary } from "@beep/ui-core/theme";
import { RegistryProvider } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type React from "react";
import { getAppConfig } from "@/app-config";
import { GlobalProviders } from "@/GlobalProviders";

const getInitialProps = getAppConfig.pipe(Effect.withSpan("getInitialProps"));

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
  // Signal to Next.js that this is a dynamic route before Effect's tracing calls Date.now()
  await connection();
  const appConfig = await runServerPromise(getInitialProps, "RootLayout.getInitialProps");

  return (
    <html lang={appConfig.lang ?? "en"} dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <GlobalProviders appConfig={appConfig}>
          <RegistryProvider>
            <KaServices />
            {children}
          </RegistryProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}
