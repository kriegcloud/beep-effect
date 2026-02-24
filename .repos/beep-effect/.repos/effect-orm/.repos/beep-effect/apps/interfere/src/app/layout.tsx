import "@beep/ui/globals.css";
import { getAppConfig, isDev } from "@beep/interfere/app-config";
import { GlobalProviders } from "@beep/interfere/GlobalProviders";
import { KaServices } from "@beep/runtime-client";
import { runServerPromise } from "@beep/runtime-server";
import { primary } from "@beep/ui-core/theme";
import { RegistryProvider } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { connection } from "next/server";
import type React from "react";

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
      <head>
        {isDev && (
          <Script
            src="https://unpkg.com/react-grab@0.0.91/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {isDev && (
          <Script src="https://unpkg.com/@react-grab/claude-code@0.0.91/dist/client.global.js" strategy="lazyOnload" />
        )}
      </head>
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
