import type { CommonColors, Direction, Theme, ThemeProviderProps } from "@mui/material/styles";
import type { PaletteColorKey, PaletteColorNoChannels } from "./core/palette";
import type { ThemeCssVariables } from "./types";

export type ThemeConfig = {
  direction: Direction;
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  defaultMode: ThemeProviderProps<Theme>["defaultMode"];
  modeStorageKey: ThemeProviderProps<Theme>["modeStorageKey"];
  fontFamily: Record<"primary" | "secondary", string>;
  palette: Record<PaletteColorKey, PaletteColorNoChannels> & {
    common: Pick<CommonColors, "black" | "white">;
    grey: {
      [K in 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 as `${K}`]: string;
    };
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  defaultMode: "dark",
  modeStorageKey: "theme-mode",
  direction: "ltr",
  classesPrefix: "minimal",
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: "",
    colorSchemeSelector: "data-color-scheme",
  },
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: "Public Sans Variable",
    secondary: "Barlow",
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    primary: {
      lighter: "#C8FAD6",
      light: "#5BE49B",
      main: "#00A76F",
      dark: "#007867",
      darker: "#004B50",
      contrastText: "#FFFFFF",
    },
    secondary: {
      lighter: "#EFD6FF",
      light: "#C684FF",
      main: "#8E33FF",
      dark: "#5119B7",
      darker: "#27097A",
      contrastText: "#FFFFFF",
    },
    info: {
      lighter: "#CAFDF5",
      light: "#61F3F3",
      main: "#00B8D9",
      dark: "#006C9C",
      darker: "#003768",
      contrastText: "#FFFFFF",
    },
    success: {
      lighter: "#D3FCD2",
      light: "#77ED8B",
      main: "#22C55E",
      dark: "#118D57",
      darker: "#065E49",
      contrastText: "#ffffff",
    },
    warning: {
      lighter: "#FFF5CC",
      light: "#FFD666",
      main: "#FFAB00",
      dark: "#B76E00",
      darker: "#7A4100",
      contrastText: "#1C252E",
    },
    error: {
      lighter: "#FFE9D5",
      light: "#FFAC82",
      main: "#FF5630",
      dark: "#B71D18",
      darker: "#7A0916",
      contrastText: "#FFFFFF",
    },
    grey: {
      50: "#FCFDFD",
      100: "#F9FAFB",
      200: "#F4F6F8",
      300: "#DFE3E8",
      400: "#C4CDD5",
      500: "#919EAB",
      600: "#637381",
      700: "#454F5B",
      800: "#1C252E",
      900: "#141A21",
    },
    common: {
      black: "#000000",
      white: "#FFFFFF",
    },
  },
};
