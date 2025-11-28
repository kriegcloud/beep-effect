"use client";

import { VersionProvider } from "@beep/notes/components/editor/version-history/version-history-panel";
import { StaticModalProvider } from "@beep/notes/components/modals";
import { AppProvider } from "@beep/notes/components/providers/app-provider";
import { TailwindProvider } from "@beep/notes/components/providers/tailwind-provider";
import { ThemeProvider } from "@beep/notes/components/providers/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableColorScheme enableSystem>
      <TailwindProvider>
        <NuqsAdapter>
          <AppProvider>
            <VersionProvider>
              {children}
              <StaticModalProvider />
            </VersionProvider>
          </AppProvider>
        </NuqsAdapter>
      </TailwindProvider>
    </ThemeProvider>
  );
}
