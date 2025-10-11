import { createPaletteChannel, rgbaFromChannel } from "@beep/ui-core/utils";
import type { ColorSystemOptions, PaletteColor, PaletteColorChannel, TypeAction } from "@mui/material/styles";
import { themeConfig } from "../theme-config";
import type { SchemesRecord } from "../types";
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
};

// Extended grey colors
export type GreyExtend = {
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
};

// Extended palette
export type PaletteExtend = {
  shared: {
    inputOutlined: string;
    inputUnderline: string;
    paperOutlined: string;
    buttonOutlined: string;
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

export const background = {
  light: createPaletteChannel({
    paper: "#FFFFFF",
    default: "#FFFFFF",
    neutral: grey[200],
  }),
  dark: createPaletteChannel({
    paper: grey[800],
    default: grey[900],
    neutral: "#28323D",
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

/**
 * ➤
 * ➤ ➤ Extended palette
 * ➤
 */
export const extendPalette: PaletteExtend = {
  shared: {
    inputUnderline: rgbaFromChannel(grey["500Channel"], opacity.inputUnderline),
    inputOutlined: rgbaFromChannel(grey["500Channel"], 0.2),
    paperOutlined: rgbaFromChannel(grey["500Channel"], 0.16),
    buttonOutlined: rgbaFromChannel(grey["500Channel"], 0.32),
  },
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
  grey,
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
    text: text.light,
    background: background.light,
    action: action("light"),
  },
  dark: {
    ...basePalette,
    text: text.dark,
    background: background.dark,
    action: action("dark"),
  },
};

export const colorKeys: {
  palette: PaletteColorKey[];
  common: CommonColorsKeys[];
} = {
  palette: ["primary", "secondary", "info", "success", "warning", "error"],
  common: ["black", "white"],
};
