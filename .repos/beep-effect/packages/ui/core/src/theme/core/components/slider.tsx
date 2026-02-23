import { rgbaFromChannel } from "@beep/ui-core/utils";
import { sliderClasses } from "@mui/material/Slider";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */
export type SliderExtendColor = { inherit: true };

type SliderVariants = ComponentsVariants<Theme>["MuiSlider"];

const SIZES = ["small", "medium"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;
const DIMENSIONS: Record<(typeof SIZES)[number], { rail: number; thumb: number; mark: number }> = {
  small: { rail: 6, thumb: 16, mark: 4 },
  medium: { rail: 10, thumb: 20, mark: 6 },
};

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const thumbVariants = [
  ...(SIZES.map((size) => ({
    props: (props) => props.size === size,
    style: {
      width: DIMENSIONS[size].thumb,
      height: DIMENSIONS[size].thumb,
    },
  })) satisfies SliderVariants),
] satisfies SliderVariants;

const railVariants = [
  ...(ORIENTATIONS.flatMap((orientation) =>
    SIZES.map((size) => ({
      props: (props) => props.orientation === orientation && props.size === size,
      style: orientation === "horizontal" ? { height: DIMENSIONS[size].rail } : { width: DIMENSIONS[size].rail },
    }))
  ) satisfies SliderVariants),
] satisfies SliderVariants;

const trackVariants = [
  ...(ORIENTATIONS.flatMap((orientation) =>
    SIZES.map((size) => ({
      props: (props) => props.orientation === orientation && props.size === size,
      style: orientation === "horizontal" ? { height: DIMENSIONS[size].rail } : { width: DIMENSIONS[size].rail },
    }))
  ) satisfies SliderVariants),
] satisfies SliderVariants;

const markVariants = [
  ...(ORIENTATIONS.flatMap((orientation) =>
    SIZES.map((size) => ({
      props: (props) => props.orientation === orientation && props.size === size,
      style:
        orientation === "horizontal"
          ? { width: 1, height: DIMENSIONS[size].mark }
          : { height: 1, width: DIMENSIONS[size].mark },
    }))
  ) satisfies SliderVariants),
] satisfies SliderVariants;

const markActiveVariants = [
  {
    props: (props) => props.color === "inherit",
    style: ({ theme }) => ({
      ...theme.applyStyles("dark", {
        backgroundColor: rgbaFromChannel(theme.vars.palette.grey["800Channel"], 0.48),
      }),
    }),
  },
] satisfies SliderVariants;

const disabledVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${sliderClasses.disabled}`]: {
        color: theme.vars.palette.action.disabled,
      },
    }),
  },
] satisfies SliderVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiSlider: Components<Theme>["MuiSlider"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    size: "small",
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      variants: [...disabledVariants],
    },
    thumb: ({ theme }) => ({
      boxShadow: theme.vars.customShadows.z1,
      color: theme.vars.palette.common.white,
      border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
      "&::before": {
        opacity: 0.4,
        boxShadow: "none",
        width: "calc(100% - 4px)",
        height: "calc(100% - 4px)",
        backgroundImage: `linear-gradient(180deg, ${theme.vars.palette.grey[500]}, transparent)`,
        ...theme.applyStyles("dark", {
          opacity: 0.8,
        }),
      },
      variants: [...thumbVariants],
    }),
    rail: ({ theme }) => ({
      opacity: 0.12,
      backgroundColor: theme.vars.palette.grey[500],
      variants: [...railVariants],
    }),
    track: {
      variants: [...trackVariants],
    },
    mark: ({ style, theme }) => ({
      backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.48),
      // start mark
      '&[data-index="0"]': { display: "none" },
      // end mark
      ...((style?.left || style?.bottom) === "100%" && { display: "none" }),
      variants: [...markVariants],
    }),
    markActive: ({ theme }) => ({
      backgroundColor: rgbaFromChannel(theme.vars.palette.common.whiteChannel, 0.64),
      variants: [...markActiveVariants],
    }),
    markLabel: ({ theme }) => ({
      fontSize: theme.typography.pxToRem(13),
      color: theme.vars.palette.text.disabled,
    }),
    valueLabel: ({ theme }) => ({
      borderRadius: 8,
      backgroundColor: theme.vars.palette.grey[800],
      ...theme.applyStyles("dark", {
        backgroundColor: theme.vars.palette.grey[700],
      }),
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const slider: Components<Theme> = {
  MuiSlider,
};
