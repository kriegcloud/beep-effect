import type { CssVarsThemeOptions } from "@mui/material/styles";

// Type augmentation for text.icon and text.tertiary is now in @beep/ui-core/theme/extend-theme-types

export const colors: CssVarsThemeOptions["colorSchemes"] = {
  light: {
    palette: {
      text: {
        icon: "rgb(0 0 0 / 0.4)", // systemGray for icons
        tertiary: "rgb(0 0 0 / 0.54)", // lowest contrast text to pass AAA
      },
      action: {
        activatedOpacity: 0.38,
        selectedOpacity: 0.06,
        disabledOpacity: 0.2,
        focusOpacity: 0.08,
      },
      primary: {
        main: "#000",
      },
      secondary: {
        main: "rgb(229, 229, 234)", // systemGray
      },
      success: {
        main: "rgb(52, 199, 89)", // green
      },
      error: {
        main: "rgb(255, 56, 60)", // red
      },
      warning: {
        main: "rgb(255, 204, 0)", // yellow
      },
      info: {
        main: "rgb(0, 136, 255)", // blue
      },
      background: {
        default: "rgb(248, 248, 248)",
      },
    },
  },
  dark: {
    palette: {
      text: {
        icon: "rgb(255 255 255 / 0.54)", // systemGray for icons in dark mode
        tertiary: "rgb(255 255 255 / 0.6)", // systemGray for tertiary text
      },
      action: {
        activatedOpacity: 0.38,
        selectedOpacity: 0.06,
        disabledOpacity: 0.2,
        focusOpacity: 0.08,
      },
      primary: {
        main: "#fff",
      },
      secondary: {
        main: "rgb(142, 142, 147)", // systemGray
      },
      success: {
        main: "rgb(48, 209, 88)", // green for dark
      },
      error: {
        main: "rgb(255, 69, 58)", // red for dark
      },
      warning: {
        main: "rgb(255, 214, 10)", // yellow for dark
      },
      info: {
        main: "rgb(0, 145, 255)", // blue for dark
      },
      background: {
        default: "rgb(0, 0, 0)", // systemGrayDark
        paper: "rgb(18, 18, 18)", // systemGrayDark
      },
    },
  },
};
