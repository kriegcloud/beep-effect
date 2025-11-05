import type { TopNavType } from "@beep/ui-core/settings";
import type { Breakpoint } from "@mui/material";
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

declare module "@mui/material/styles" {
  interface Mixins {
    topbar: Record<TopNavType.Type, Partial<Record<Breakpoint, number>>>;
    ecommerceTopbar: Partial<Record<Breakpoint, number>>;
    footer: Required<Pick<Record<Breakpoint, number>, "xs" | "sm">>;
    topOffset: (
      topbarHeight: Partial<Record<Breakpoint, number>>,
      offset?: number,
      important?: boolean
    ) => Partial<Record<Breakpoint, number>>;
    contentHeight: (
      topnavType: Partial<Record<Breakpoint, number>>,
      offset?: number,
      important?: boolean
    ) => {
      [key: string]: string;
    };
  }
}
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
  ecommerceTopbar: {
    xs: 188,
    sm: 190,
    md: 162,
  },
  hideScrollY: {
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    overflowY: "auto",
    "&::-webkit-scrollbar": { display: "none" },
  },
  topOffset: (topbarHeight, offset = 0, important = false) =>
    topbarHeight
      ? Object.entries(topbarHeight).reduce((acc: { [key: string]: string }, [key, value]) => {
          acc[key] = `${value + offset}px${important ? " !important" : ""}`;
          return acc;
        }, {})
      : {},

  contentHeight: (topbarHeight, offset = 0, important = false) =>
    topbarHeight
      ? Object.entries(topbarHeight).reduce((acc: { [key: string]: string }, [key, value]) => {
          acc[key] = `calc(100vh - ${value + offset}px)${important ? " !important" : ""}`;
          return acc;
        }, {})
      : {},
  topbar: {
    default: {
      xs: 64,
      md: 82,
    },
    slim: {
      xs: 38,
    },
    stacked: {
      xs: 129,
      md: 103,
    },
  },
  footer: { xs: 72, sm: 56 },
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
