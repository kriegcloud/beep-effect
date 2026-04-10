declare module "@beep/ui/components/button" {
  import type * as React from "react";

  export interface ButtonProps {
    readonly children?: React.ReactNode;
    readonly [key: string]: unknown;
  }

  export const Button: React.ComponentType<ButtonProps>;
}

declare module "@beep/ui/themes" {
  import type * as React from "react";

  export type ThemeMode = "light" | "dark" | "system";

  export interface ThemeModeControls {
    readonly mode: ThemeMode;
    readonly resolvedMode: "light" | "dark";
    readonly setMode: (mode: ThemeMode | null) => void;
    readonly toggleMode: () => void;
  }

  export const ThemeMode: {
    readonly Enum: {
      readonly light: "light";
      readonly dark: "dark";
      readonly system: "system";
    };
  };

  export const AppThemeProvider: React.ComponentType<{
    readonly children?: React.ReactNode;
    readonly defaultMode?: ThemeMode;
  }>;

  export const useThemeMode: () => ThemeModeControls;
}

declare module "@beep/ui/themes/theme" {
  import type { Theme } from "@mui/material/styles";

  export const theme: Theme;
}

declare module "@beep/ui/styles/globals.css" {
  const stylesheet: string;
  export default stylesheet;
}
