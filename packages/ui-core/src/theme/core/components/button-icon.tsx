import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";

import { colorKeys } from "../palette";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */
export type IconButtonExtendColor = { black: true; white: true };

type IconButtonVariants = ComponentsVariants<Theme>["MuiIconButton"];

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const colorVariants = [
  ...(colorKeys.common.map((colorKey) => ({
    props: (props) => props.color === colorKey,
    style: ({ theme }) => ({
      color: theme.vars.palette.common[colorKey],
    }),
  })) satisfies IconButtonVariants),
] satisfies IconButtonVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiIconButton: Components<Theme>["MuiIconButton"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      variants: [...colorVariants],
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const iconButton: Components<Theme> = {
  MuiIconButton,
};
