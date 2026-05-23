"use client";
import { createTheme } from "@mui/material/styles";
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
import type { Theme } from "@mui/material/styles";
import type {} from "@mui/material/themeCssVarsAugmentation";
import type { ThemeOptions } from "./types.ts";

/**
 * Base theme options shared by `@beep/ui`.
 *
 * @since 0.0.0
 * @category themes
 */
export const themeOptions: ThemeOptions = {
  cssVariables: {
    colorSchemeSelector: "class",
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
};

/**
 * Creates a shared `@beep/ui` theme with optional app-level overrides.
 *
 * @since 0.0.0
 * @category constructors
 */
export const createAppTheme = (overrides: ThemeOptions = {}): Theme => createTheme(themeOptions, overrides);

/**
 * The shared MUI theme used by `@beep/ui`.
 *
 * @since 0.0.0
 * @category themes
 */
export const theme = createAppTheme();
