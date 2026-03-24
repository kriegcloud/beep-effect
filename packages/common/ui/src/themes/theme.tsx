"use client";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";
import type React from "react";
import { colors } from "./colors.ts";
import { alertTheme } from "./components/alert.ts";
import { autocompleteTheme } from "./components/autocomplete.ts";
import { avatarTheme } from "./components/avatar.ts";
import { buttonTheme } from "./components/button.ts";
import { cardTheme } from "./components/card.ts";
import { chipTheme } from "./components/chip.ts";
import { controlsTheme } from "./components/controls.ts";
import { dataGridTheme } from "./components/data-grid.ts";
import { datePickerTheme } from "./components/date-picker.ts";
import { dialogTheme } from "./components/dialog.ts";
import { layoutTheme } from "./components/layout.ts";
import { linkTheme } from "./components/link.ts";
import { listTheme } from "./components/list.ts";
import { menuTheme } from "./components/menu.ts";
import { selectTheme } from "./components/select.ts";
import { svgIconTheme } from "./components/svg-icon.ts";
import { tableTheme } from "./components/table.ts";
import { textFieldTheme } from "./components/text-field.ts";
import { treeViewTheme } from "./components/tree-view.ts";
import { shadows } from "./shadows.ts";
import { typography, typographyTheme } from "./typography.ts";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
    cssVarPrefix: "plus",
  },
  colorSchemes: colors,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...buttonTheme,
    ...textFieldTheme,
    ...selectTheme,
    ...menuTheme,
    ...autocompleteTheme,
    ...chipTheme,
    ...avatarTheme,
    ...tableTheme,
    ...cardTheme,
    ...dialogTheme,
    ...datePickerTheme,
    ...svgIconTheme,
    ...dataGridTheme,
    ...alertTheme,
    ...treeViewTheme,
    ...layoutTheme,
    ...linkTheme,
    ...controlsTheme,
    ...listTheme,
    ...typographyTheme,
  },
  typography,
  shadows,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default theme;
