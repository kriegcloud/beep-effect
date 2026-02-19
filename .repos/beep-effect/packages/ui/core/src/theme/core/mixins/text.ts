import { remToPx } from "@beep/ui-core/utils";
import type { CSSObject } from "@mui/material/styles";

import { createTheme as getTheme } from "@mui/material/styles";

/**
 * Creates a text gradient effect by applying a linear gradient as the text color.
 *
 * @param color - The gradient color definition.
 * @returns A CSSObject that applies the gradient as text color.
 *
 * @example
 * ...theme.mixins.textGradient( `to right, ${theme.vars.palette.text.primary}, ${rgbaFromChannel(theme.vars.palette.text.primary, 0.2)}` )
 */

export function textGradient(color?: string): CSSObject {
  return {
    background: `linear-gradient(${color})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
    color: "transparent",
  };
}

/**
 * Creates a multi-line text truncation style with optional height calculation based on typography.
 *
 * @param line - The number of lines to clamp.
 * @param persistent - (Optional) Typography properties to calculate fixed height (e.g., fontSize, lineHeight).
 * @returns A CSS object with styles.
 *
 * @example
 * // Simple multi-line clamp
 * ...theme.mixins.maxLine({ line: 2 })
 *
 * @example
 * // Clamp with calculated height based on typography
 * theme.mixins.maxLine({
 *  line: 2,
 *  persistent: theme.typography.caption,
 * })
 */

type MediaFontSize = {
  [key: string]: {
    fontSize: React.CSSProperties["fontSize"];
  };
};

export type MaxLineProps = {
  line: number;
  persistent?: Partial<React.CSSProperties>;
};

function getFontSize(fontSize: React.CSSProperties["fontSize"]) {
  return typeof fontSize === "string" ? remToPx(fontSize) : fontSize;
}

function getLineHeight(lineHeight: React.CSSProperties["lineHeight"], fontSize?: number) {
  if (typeof lineHeight === "string") {
    return fontSize ? remToPx(lineHeight) / fontSize : 1;
  }

  return lineHeight;
}

function calculateHeight(fontSize: number, lineHeight: number, line: number): number {
  return fontSize * lineHeight * line;
}

export function maxLine({ line, persistent }: MaxLineProps): CSSObject {
  const {
    breakpoints: { keys, up },
  } = getTheme();

  const baseStyles: CSSObject = {
    overflow: "hidden",
    display: "-webkit-box",
    textOverflow: "ellipsis",
    WebkitLineClamp: line,
    WebkitBoxOrient: "vertical",
  };

  if (!persistent) {
    return baseStyles;
  }

  const fontSizeBase = getFontSize(persistent.fontSize);
  const lineHeight = getLineHeight(persistent.lineHeight, fontSizeBase);

  if (!lineHeight || !fontSizeBase) {
    return baseStyles;
  }

  const responsiveStyles = keys.reduce((acc, breakpoint) => {
    const fontSize = getFontSize((persistent as MediaFontSize)[up(breakpoint)]?.fontSize);

    if (fontSize) {
      acc[up(breakpoint)] = {
        height: calculateHeight(fontSize, lineHeight, line),
      };
    }

    return acc;
  }, {} as CSSObject);

  return {
    ...baseStyles,
    height: calculateHeight(fontSizeBase, lineHeight, line),
    ...responsiveStyles,
  };
}
