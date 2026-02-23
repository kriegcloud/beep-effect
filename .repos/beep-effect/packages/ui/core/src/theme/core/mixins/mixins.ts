import type { CSSObject, MixinsOptions } from "@mui/material/styles";
import { bgBlur, bgGradient } from "./background";
import { borderGradient } from "./border";
import { filledStyles, menuItemStyles, paperStyles, softStyles } from "./global-styles-components";
import { maxLine, textGradient } from "./text";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */

export type * from "./background";
export type * from "./border";
export type * from "./global-styles-components";
export type * from "./text";

export type MixinsExtend = {
  hideScrollX: {
    [K in keyof CSSObject]: Exclude<CSSObject[K], undefined>;
  };
  hideScrollY: {
    [K in keyof CSSObject]: Exclude<CSSObject[K], undefined>;
  };
  bgBlur: typeof bgBlur;
  maxLine: typeof maxLine;
  bgGradient: typeof bgGradient;
  softStyles: typeof softStyles;
  paperStyles: typeof paperStyles;
  textGradient: typeof textGradient;
  filledStyles: typeof filledStyles;
  borderGradient: typeof borderGradient;
  menuItemStyles: typeof menuItemStyles;
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const mixins: MixinsOptions = {
  hideScrollX: {
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    overflowX: "auto",
    "&::-webkit-scrollbar": { display: "none" },
  },
  hideScrollY: {
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    overflowY: "auto",
    "&::-webkit-scrollbar": { display: "none" },
  },
  bgBlur,
  maxLine,
  bgGradient,
  softStyles,
  paperStyles,
  textGradient,
  filledStyles,
  borderGradient,
  menuItemStyles,
};
