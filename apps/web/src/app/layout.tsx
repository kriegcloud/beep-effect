import "@beep/ui/globals.css";
import { primary } from "@beep/ui-core/theme";
import type { Metadata, Viewport } from "next";
import { headers as nextHeaders } from "next/headers";
import type React from "react";
import "dayjs/locale/en";
import "dayjs/locale/vi";
import "dayjs/locale/fr";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ar-sa";
import { KaServices } from "@beep/runtime-client";
import { runServerPromise } from "@beep/runtime-server";
import { RegistryProvider } from "@effect-atom/atom-react";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import Script from "next/script";
import { getAppConfig } from "@/app-config";
import { GlobalProviders } from "@/GlobalProviders";

export const runtime = "nodejs";

class NonceError extends Data.TaggedError("NonceError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

const getNonce = Effect.gen(function* () {
  const headers = yield* Effect.tryPromise({
    try: async () => await nextHeaders(),
    catch: (e) => new NonceError({ cause: e, message: "Failed to get ReadonlyHeaders from next/headers" }),
  });

  const nonce = headers.get("x-nonce") || undefined;
  if (!nonce) {
    return undefined;
  }
  return nonce;
}).pipe(
  Effect.withSpan("getNonce"),
  Effect.orElseSucceed(() => undefined)
);

const getInitialProps = Effect.all([getNonce, getAppConfig]).pipe(Effect.withSpan("getInitialProps"));

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
  const [nonce, appConfig] = await runServerPromise(getInitialProps, "RootLayout.getInitialProps");

  return (
    <html lang={appConfig.lang ?? "en"} dir={appConfig.dir} suppressHydrationWarning>
      <Script src="https://www.googletagmanager.com/gtag/js" strategy="afterInteractive" nonce={nonce} />
      <body>
        <GlobalProviders appConfig={appConfig} nonce={nonce}>
          <RegistryProvider>
            <KaServices />
            {children}
          </RegistryProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}
