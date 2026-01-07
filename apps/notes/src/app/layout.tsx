import { GA } from "@beep/notes/components/analytics/ga";
import { Providers } from "@beep/notes/components/providers/providers";
import { ProvidersServer } from "@beep/notes/components/providers/providers-server";
import { Toaster } from "@beep/notes/components/toaster";
import { META_THEME_COLORS } from "@beep/notes/config";
import { fontHeading, fontMono, fontSans } from "@beep/notes/lib/fonts";
import { createMetadata } from "@beep/notes/lib/navigation/createMetadata";
import { cn } from "@beep/notes/lib/utils";
import type { Viewport } from "next";
import type * as React from "react";

import "./globals.css";

export const metadata = createMetadata({
  title: "Todox",
  titlePrefix: "",
});

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Theme initialization script to prevent FOUC
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
        <meta name="darkreader-lock" />
      </head>
      <body
        className={cn(
          "relative min-h-dvh overflow-x-hidden scroll-smooth bg-background font-sans text-clip text-foreground",
          "[&_.slate-selection-area]:bg-brand/[.13]",
          "antialiased",
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable
        )}
        vaul-drawer-wrapper=""
        suppressHydrationWarning
      >
        <ProvidersServer>
          <Providers>{children}</Providers>
        </ProvidersServer>

        <GA />
        <Toaster />
      </body>
    </html>
  );
}
