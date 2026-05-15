/**
 * OPIP app theme provider.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { AppThemeProvider, createAppTheme, ThemeMode, type ThemeOptions } from "@beep/ui/themes";
import type { ReactNode } from "react";

const opipThemeOptions = {
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#5b1a1a",
        },
        secondary: {
          main: "#c9a24b",
        },
        background: {
          default: "#f4ede0",
          paper: "#fffaf0",
        },
        text: {
          primary: "#2a2a2a",
          secondary: "#6f675c",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#dcb85a",
        },
        secondary: {
          main: "#ce6f66",
        },
        background: {
          default: "#181512",
          paper: "#211d19",
        },
        text: {
          primary: "#efe7d9",
          secondary: "#b9aa94",
        },
      },
    },
  },
} satisfies ThemeOptions;

const opipTheme = createAppTheme(opipThemeOptions);

/**
 * Provides the OPIP theme while reusing the shared `@beep/ui` theme base.
 *
 * @example
 * ```tsx
 * import { OpipThemeProvider } from "@beep/opip-web/components/OpipThemeProvider"
 *
 * const provider = <OpipThemeProvider><main /></OpipThemeProvider>
 * console.log(provider.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function OpipThemeProvider({ children }: { readonly children: ReactNode }) {
  return (
    <AppThemeProvider defaultMode={ThemeMode.Enum.light} theme={opipTheme}>
      {children}
    </AppThemeProvider>
  );
}
