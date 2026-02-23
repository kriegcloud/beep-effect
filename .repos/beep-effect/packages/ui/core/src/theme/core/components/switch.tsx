import { rgbaFromChannel } from "@beep/ui-core/utils";
import { switchClasses } from "@mui/material/Switch";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";

type SwitchVariants = ComponentsVariants<Theme>["MuiSwitch"];

const DIMENSIONS: Record<
  "small" | "medium",
  { thumb: number; track: number; trackRadius: number; translateX: string }
> = {
  small: { thumb: 10, track: 16, trackRadius: 8, translateX: "10px" },
  medium: { thumb: 14, track: 20, trackRadius: 10, translateX: "14px" },
};

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const colorVariants = [
  {
    props: (props) => props.color === "default",
    style: ({ theme }) => ({
      [`&.${switchClasses.checked}`]: {
        [`& + .${switchClasses.track}`]: {
          backgroundColor: theme.vars.palette.text.primary,
        },
        [`& .${switchClasses.thumb}`]: {
          ...theme.applyStyles("dark", {
            color: theme.vars.palette.grey[800],
          }),
        },
      },
    }),
  },
] satisfies SwitchVariants;

const sizeVariants = [
  {
    props: (props) => props.size === "small",
    style: {
      [`& .${switchClasses.switchBase}`]: {
        [`&.${switchClasses.checked}`]: {
          transform: `translateX(${DIMENSIONS.small.translateX})`,
        },
      },
      [`& .${switchClasses.thumb}`]: {
        width: DIMENSIONS.small.thumb,
        height: DIMENSIONS.small.thumb,
      },
      [`& .${switchClasses.track}`]: {
        height: DIMENSIONS.small.track,
        borderRadius: DIMENSIONS.small.trackRadius,
      },
    },
  },
] satisfies SwitchVariants;

const disabledVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${switchClasses.disabled}`]: {
        [`& + .${switchClasses.track}`]: {
          opacity: theme.vars.opacity.switchTrackDisabled,
        },
        [`& .${switchClasses.thumb}`]: {
          ...theme.applyStyles("dark", {
            opacity: theme.vars.opacity.switchTrackDisabled,
          }),
        },
      },
    }),
  },
] satisfies SwitchVariants;

const checkedVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${switchClasses.checked}`]: {
        transform: `translateX(${DIMENSIONS.medium.translateX})`,
        [`& + .${switchClasses.track}`]: {
          opacity: theme.vars.opacity.switchTrack,
        },
      },
    }),
  },
] satisfies SwitchVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiSwitch: Components<Theme>["MuiSwitch"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      alignItems: "center",
      variants: [...sizeVariants],
    },
    switchBase: {
      top: "auto",
      left: "6px",
      variants: [...colorVariants, ...disabledVariants, ...checkedVariants],
    },
    thumb: ({ theme }) => ({
      width: DIMENSIONS.medium.thumb,
      height: DIMENSIONS.medium.thumb,
      color: theme.vars.palette.common.white,
    }),
    track: ({ theme }) => ({
      height: DIMENSIONS.medium.track,
      borderRadius: DIMENSIONS.medium.trackRadius,
      backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.48),
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const switches: Components<Theme> = {
  MuiSwitch,
};
