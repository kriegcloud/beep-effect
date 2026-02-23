import { rgbaFromChannel } from "@beep/ui-core/utils";
import { buttonGroupClasses } from "@mui/material/ButtonGroup";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";

import { colorKeys } from "../palette";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */
export type ButtonGroupExtendVariant = { soft: true };
export type ButtonGroupExtendColor = { black: true; white: true };

type ButtonGroupVariants = ComponentsVariants<Theme>["MuiButtonGroup"];

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const containedVariants = [
  {
    props: (props) => props.variant === "contained",
    style: ({ theme }) => ({
      borderColor: theme.vars.palette.shared.buttonOutlined,
    }),
  },
  ...(colorKeys.palette.map((colorKey) => ({
    props: (props) => props.variant === "contained" && props.color === colorKey,
    style: ({ theme }) => ({
      borderColor: rgbaFromChannel(theme.vars.palette[colorKey].darkChannel, theme.vars.opacity.outlined.border),
    }),
  })) satisfies ButtonGroupVariants),
] satisfies ButtonGroupVariants;

const textVariants = [
  {
    props: (props) => props.variant === "text",
    style: ({ theme }) => ({
      borderColor: rgbaFromChannel("currentColor", theme.vars.opacity.outlined.border),
    }),
  },
  {
    props: (props) => props.variant === "text" && props.color === "inherit",
    style: ({ theme }) => ({
      borderColor: theme.vars.palette.shared.buttonOutlined,
    }),
  },
] satisfies ButtonGroupVariants;

const softVariants = [
  {
    props: (props) => props.variant === "soft",
    style: ({ theme }) => ({
      borderStyle: "solid",
      borderColor: rgbaFromChannel("currentColor", theme.vars.opacity.soft.border),
    }),
  },
  {
    props: (props) => props.variant === "soft" && props.color === "inherit",
    style: ({ theme }) => ({
      borderColor: theme.vars.palette.shared.buttonOutlined,
    }),
  },
] satisfies ButtonGroupVariants;

const firstButtonVariants = [
  {
    props: (props) => props.variant === "soft" && props.orientation === "horizontal",
    style: { borderRightWidth: 1 },
  },
  {
    props: (props) => props.variant === "soft" && props.orientation === "vertical",
    style: { borderBottomWidth: 1 },
  },
] satisfies ButtonGroupVariants;

const disabledVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${buttonGroupClasses.disabled}`]: {
        borderColor: theme.vars.palette.action.disabledBackground,
      },
    }),
  },
] satisfies ButtonGroupVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiButtonGroup: Components<Theme>["MuiButtonGroup"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    color: "inherit",
    disableElevation: true,
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    grouped: {
      variants: [...containedVariants, ...textVariants, ...softVariants, ...disabledVariants],
    },
    firstButton: {
      variants: [...firstButtonVariants],
    },
    middleButton: {
      variants: [...firstButtonVariants],
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const buttonGroup: Components<Theme> = {
  MuiButtonGroup,
};
