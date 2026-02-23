import { rgbaFromChannel } from "@beep/ui-core/utils";
import { paginationItemClasses } from "@mui/material/PaginationItem";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";

import { colorKeys } from "../palette";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */
export type PaginationExtendVariant = { soft: true };
export type PaginationExtendColor = {
  info: true;
  success: true;
  warning: true;
  error: true;
};

type PaginationItemVariants = ComponentsVariants<Theme>["MuiPaginationItem"];

const baseColors = ["standard"] as const;
const allColors = [...baseColors, ...colorKeys.palette] as const;

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const textVariants = [
  {
    props: (props) => props.variant === "text" && props.color === "standard",
    style: ({ theme }) => ({
      [`&.${paginationItemClasses.selected}`]: {
        ...theme.mixins.filledStyles(theme, "inherit", { hover: true }),
      },
    }),
  },
] satisfies PaginationItemVariants;

const outlinedVariants = [
  {
    props: (props) => props.variant === "outlined",
    style: ({ theme }) => ({
      borderColor: theme.vars.palette.shared.buttonOutlined,
      [`&.${paginationItemClasses.selected}`]: {
        borderColor: "currentColor",
        backgroundColor: rgbaFromChannel("currentColor", theme.vars.palette.action.selectedOpacity),
        "&:hover": {
          backgroundColor: rgbaFromChannel("currentColor", `calc(${theme.vars.palette.action.selectedOpacity} * 2)`),
        },
      },
    }),
  },
  {
    props: (props) => props.variant === "outlined" && props.color === "standard",
    style: ({ theme }) => ({
      [`&.${paginationItemClasses.selected}`]: {
        backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
        "&:hover": {
          backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16),
        },
      },
    }),
  },
] satisfies PaginationItemVariants;

const softVariants = [
  ...(allColors.map((colorKey) => ({
    props: (props) => props.variant === "soft" && props.color === colorKey,
    style: ({ theme }) => {
      const currentColor = colorKey === "standard" ? "inherit" : colorKey;

      return {
        [`&.${paginationItemClasses.selected}`]: {
          ...theme.mixins.softStyles(theme, currentColor, { hover: true }),
        },
      };
    },
  })) satisfies PaginationItemVariants),
] satisfies PaginationItemVariants;

const disabledVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${paginationItemClasses.disabled}`]: {
        [`&.${paginationItemClasses.selected}`]: {
          backgroundColor: theme.vars.palette.action.disabledBackground,
        },
      },
    }),
  },
] satisfies PaginationItemVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiPaginationItem: Components<Theme>["MuiPaginationItem"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      [`&.${paginationItemClasses.selected}`]: {
        fontWeight: theme.typography.fontWeightSemiBold,
      },
      variants: [...textVariants, ...outlinedVariants, ...softVariants, ...disabledVariants],
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const pagination: Components<Theme> = {
  MuiPaginationItem,
};
