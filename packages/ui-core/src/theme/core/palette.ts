import { createPaletteChannel, cssVarRgba, rgbaFromChannel } from "@beep/ui-core/utils";
import type { ColorSystemOptions, PaletteColor, PaletteColorChannel, TypeAction } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { themeConfig } from "../theme-config";
import type { SchemesRecord } from "../types";
import { blue, green, lightBlue, orange, red } from "./colors";
import { opacity } from "./opacity";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../extend-theme-types.d.ts}
 */

// Keys for core palette colors
export type PaletteColorKey = "primary" | "secondary" | "info" | "success" | "warning" | "error";
export type CommonColorsKeys = "black" | "white";

// Palette color without channels
export type PaletteColorNoChannels = Omit<PaletteColor, "lighterChannel" | "darkerChannel">;

// Palette color with channels
export type PaletteColorWithChannels = PaletteColor & PaletteColorChannel;

// Extended palette color shades
export type PaletteColorExtend = {
  lighter: string;
  darker: string;
  lighterChannel: string;
  darkerChannel: string;
};

// Extended common colors
export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

// Extended text colors
export type TypeTextExtend = {
  disabledChannel: string;
};

// Extended background colors
export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
  elevation1: string;
  elevation2: string;
  elevation3: string;
  elevation4: string;
  menu: string;
  menuElevation1: string;
  menuElevation2: string;
  elevation1Channel: string;
  elevation2Channel: string;
  elevation3Channel: string;
  elevation4Channel: string;
  menuChannel: string;
  menuElevation1Channel: string;
  menuElevation2Channel: string;
};

// Extended grey colors
export type GreyExtend = {
  950: string;
  "50Channel": string;
  "100Channel": string;
  "200Channel": string;
  "300Channel": string;
  "400Channel": string;
  "500Channel": string;
  "600Channel": string;
  "700Channel": string;
  "800Channel": string;
  "900Channel": string;
  "950Channel": string;
};

interface ColorExtended {
  950: string;
  "50Channel": string;
  "100Channel": string;
  "200Channel": string;
  "300Channel": string;
  "400Channel": string;
  "500Channel": string;
  "600Channel": string;
  "700Channel": string;
  "800Channel": string;
  "900Channel": string;
  "950Channel": string;
}

// Extended palette
export type PaletteExtend = {
  shared: {
    inputOutlined: string;
    inputUnderline: string;
    paperOutlined: string;
    buttonOutlined: string;
  };
  dividerLight: string;
  neutral: PaletteColor;
  menuDivider: string;
  grey: ColorExtended;
  chGrey: ColorExtended;
  chRed: ColorExtended;
  chBlue: ColorExtended;
  chGreen: ColorExtended;
  chOrange: ColorExtended;
  chLightBlue: ColorExtended;

  vibrant: {
    listItemHover: string;
    buttonHover: string;
    textFieldHover: string;
    text: {
      secondary: string;
      disabled: string;
    };
    overlay: string;
  };
};
/**
 * ➤
 * ➤ ➤ Core palette (primary, secondary, info, success, warning, error, common, grey)
 * ➤
 */
export const primary = createPaletteChannel(themeConfig.palette.primary);
export const secondary = createPaletteChannel(themeConfig.palette.secondary);
export const info = createPaletteChannel(themeConfig.palette.info);
export const success = createPaletteChannel(themeConfig.palette.success);
export const warning = createPaletteChannel(themeConfig.palette.warning);
export const error = createPaletteChannel(themeConfig.palette.error);
export const common = createPaletteChannel(themeConfig.palette.common);
export const grey = createPaletteChannel(themeConfig.palette.grey);
const neutral = createPaletteChannel({
  lighter: grey[100],
  light: grey[600],
  main: grey[800],
  dark: grey[900],
  darker: grey[950],
  contrastText: common.white,
});
const chGrey = createPaletteChannel({
  50: "#F7FAFC",
  100: "#EBF2F5",
  200: "#DBE6EB",
  300: "#C3D3DB",
  400: "#9CAEB8",
  500: "#77878F",
  600: "#4D595E",
  700: "#262D30",
  800: "#1B2124",
  900: "#111417",
  950: "#06080A",
});
const chRed = createPaletteChannel(red);
const chBlue = createPaletteChannel(blue);
const chGreen = createPaletteChannel(green);
const chOrange = createPaletteChannel(orange);
const chLightBlue = createPaletteChannel(lightBlue);
const vibrantLight = {
  listItemHover: cssVarRgba(common.whiteChannel, 0.5),
  buttonHover: cssVarRgba(common.whiteChannel, 0.7),
  textFieldHover: cssVarRgba(common.whiteChannel, 0.7),
  text: {
    secondary: alpha("#1B150F", 0.76),
    disabled: alpha("#1B150F", 0.4),
  },
  overlay: cssVarRgba(common.whiteChannel, 0.7),
};

const vibrantDark = {
  listItemHover: cssVarRgba(common.whiteChannel, 0.1),
  buttonHover: cssVarRgba(common.whiteChannel, 0.1),
  textFieldHover: cssVarRgba(common.whiteChannel, 0.1),
  text: {
    secondary: cssVarRgba(common.whiteChannel, 0.7),
    disabled: cssVarRgba(common.whiteChannel, 0.5),
  },
  overlay: cssVarRgba(common.whiteChannel, 0),
};
/**
 * ➤
 * ➤ ➤ Text, background, action
 * ➤
 */
export const text = {
  light: createPaletteChannel({
    primary: grey[800],
    secondary: grey[600],
    disabled: grey[500],
  }),
  dark: createPaletteChannel({
    primary: "#FFFFFF",
    secondary: grey[500],
    disabled: grey[600],
  }),
};

export const basic = {
  white: "#ffffff",
  black: "#000000",
};
export const background = {
  light: createPaletteChannel({
    paper: "#FFFFFF",
    default: "#FFFFFF",
    neutral: grey[200],
    elevation1: grey[50],
    elevation2: grey[100],
    elevation3: grey[200],
    elevation4: grey[300],
    menu: basic.white,
    menuElevation1: grey[50],
    menuElevation2: grey[100],
  }),
  dark: createPaletteChannel({
    paper: grey[800],
    default: grey[900],
    neutral: "#28323D",
    elevation1: grey[900],
    elevation2: grey[800],
    elevation3: grey[700],
    elevation4: grey[600],
    menu: grey[900],
    menuElevation1: grey[800],
    menuElevation2: grey[700],
  }),
};

export const action = (mode: "light" | "dark"): Partial<TypeAction> => ({
  active: mode === "light" ? grey[600] : grey[500],
  hover: rgbaFromChannel(grey["500Channel"], 0.08),
  selected: rgbaFromChannel(grey["500Channel"], 0.16),
  focus: rgbaFromChannel(grey["500Channel"], 0.24),
  disabled: rgbaFromChannel(grey["500Channel"], 0.8),
  disabledBackground: rgbaFromChannel(grey["500Channel"], 0.24),
  hoverOpacity: 0.08,
  selectedOpacity: 0.08,
  focusOpacity: 0.12,
  activatedOpacity: 0.12,
  disabledOpacity: 0.48,
});
const menuDividerLight = cssVarRgba(grey["700Channel"], 0);
const menuDividerDark = grey[700];
const dividerLight = grey[800];
/**
 * ➤
 * ➤ ➤ Extended palette
 * ➤
 */
export const extendPalette: Omit<PaletteExtend, "menuDivider" | "vibrant" | "dividerLight"> = {
  shared: {
    inputUnderline: rgbaFromChannel(grey["500Channel"], opacity.inputUnderline),
    inputOutlined: rgbaFromChannel(grey["500Channel"], 0.2),
    paperOutlined: rgbaFromChannel(grey["500Channel"], 0.16),
    buttonOutlined: rgbaFromChannel(grey["500Channel"], 0.32),
  },
  neutral,
  chGrey,
  chRed,
  chBlue,
  chGreen,
  chOrange,
  chLightBlue,
  grey,
};

/**
 * ➤
 * ➤ ➤ Base configuration
 * ➤
 */
export const basePalette: ColorSystemOptions["palette"] = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  divider: rgbaFromChannel(grey["500Channel"], 0.2),
  TableCell: { border: rgbaFromChannel(grey["500Channel"], 0.2) },
  ...extendPalette,
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const palette: SchemesRecord<ColorSystemOptions["palette"]> = {
  light: {
    ...basePalette,
    menuDivider: menuDividerLight,
    text: text.light,
    background: background.light,
    action: action("light"),
    vibrant: vibrantLight,
    dividerLight: cssVarRgba(grey["300Channel"], 0.6),
  },
  dark: {
    ...basePalette,
    menuDivider: menuDividerDark,
    text: text.dark,
    background: background.dark,
    action: action("dark"),
    vibrant: vibrantDark,
    dividerLight,
  },
} as SchemesRecord<ColorSystemOptions["palette"]>;

export const colorKeys: {
  palette: PaletteColorKey[];
  common: CommonColorsKeys[];
} = {
  palette: ["primary", "secondary", "info", "success", "warning", "error"],
  common: ["black", "white"],
};
