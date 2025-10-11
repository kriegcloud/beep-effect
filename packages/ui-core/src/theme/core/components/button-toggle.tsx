import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { Components, ComponentsVariants, CSSObject, Theme } from "@mui/material/styles";

import { toggleButtonClasses } from "@mui/material/ToggleButton";

import { colorKeys } from "../palette";

type ToggleButtonVariants = ComponentsVariants<Theme>["MuiToggleButton"];
type ToggleButtonGroupVariants = ComponentsVariants<Theme>["MuiToggleButtonGroup"];

const SIZES = ["small", "medium", "large"] as const;
const DIMENSIONS: Record<(typeof SIZES)[number] | "group", CSSObject> = {
  small: { "--size": "40px", "--padding": "7px" },
  medium: { "--size": "48px", "--padding": "11px" },
  large: { "--size": "56px", "--padding": "15px" },
  group: { "--group-gap": "4px" },
};

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const colorVariants = [
  ...(colorKeys.palette.map((colorKey) => ({
    props: (props) => props.color === colorKey,
    style: ({ theme }) => ({
      "&:hover": {
        borderColor: rgbaFromChannel(theme.vars.palette[colorKey].mainChannel, theme.vars.opacity.outlined.border),
        backgroundColor: rgbaFromChannel(
          theme.vars.palette[colorKey].mainChannel,
          theme.vars.palette.action.hoverOpacity
        ),
      },
    }),
  })) satisfies ToggleButtonVariants),
] satisfies ToggleButtonVariants;

const sizeVariants = [
  ...(SIZES.map((size) => ({
    props: (props) => props.size === size,
    style: { ...DIMENSIONS[size] },
  })) satisfies ToggleButtonVariants),
] satisfies ToggleButtonVariants;

const standaloneStateVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${toggleButtonClasses.selected}`]: {
        borderColor: "currentColor",
        boxShadow: "0 0 0 0.75px currentColor",
      },
      [`&.${toggleButtonClasses.disabled}`]: {
        boxShadow: "none",
        color: theme.vars.palette.action.disabled,
        borderColor: theme.vars.palette.action.disabledBackground,
        [`&.${toggleButtonClasses.selected}`]: {
          backgroundColor: theme.vars.palette.action.disabledBackground,
        },
      },
    }),
  },
] satisfies ToggleButtonVariants;

const groupedStateVariants = [
  {
    props: {},
    style: {
      [`&.${toggleButtonClasses.selected}`]: { boxShadow: "none" },
      [`&.${toggleButtonClasses.disabled}`]: { border: "none" },
    },
  },
] satisfies ToggleButtonGroupVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiToggleButton: Components<Theme>["MuiToggleButton"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      gap: 8,
      minWidth: "var(--size)",
      minHeight: "var(--size)",
      padding: "var(--padding)",
      fontWeight: theme.typography.fontWeightSemiBold,
      variants: [...colorVariants, ...sizeVariants, ...standaloneStateVariants],
    }),
  },
};

const MuiToggleButtonGroup: Components<Theme>["MuiToggleButtonGroup"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      ...DIMENSIONS.group,
      gap: "var(--group-gap)",
      padding: "var(--group-gap)",
      border: `1px solid ${theme.vars.palette.shared.paperOutlined}`,
    }),
    grouped: () => ({
      border: "none",
      borderRadius: "inherit",
      padding: "calc(var(--padding) - var(--group-gap))",
      minWidth: "calc(var(--size) - (var(--group-gap) * 2 + 2px))",
      minHeight: "calc(var(--size) - (var(--group-gap) * 2 + 2px))",
      variants: [...groupedStateVariants],
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const toggleButton: Components<Theme> = {
  MuiToggleButton,
  MuiToggleButtonGroup,
};
