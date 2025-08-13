import type { CSSObject, Theme } from "@mui/material/styles";

// ----------------------------------------------------------------------

type NavItemStyles = {
  icon: CSSObject;
  info: CSSObject;
  texts: CSSObject;
  disabled: CSSObject;
  captionIcon: CSSObject;
  title: (theme: Theme) => CSSObject;
  arrow: (theme: Theme) => CSSObject;
  captionText: (theme: Theme) => CSSObject;
};

export const navItemStyles: NavItemStyles = {
  icon: {
    width: 22,
    height: 22,
    flexShrink: 0,
    display: "inline-flex",
    /**
     * As ':first-child' for ssr
     * https://github.com/emotion-js/emotion/issues/1105#issuecomment-1126025608
     */
    "& > :first-of-type:not(style):not(:first-of-type ~ *), & > style + *": {
      width: "100%",
      height: "100%",
    },
  },
  texts: { flex: "1 1 auto", display: "inline-flex", flexDirection: "column" },
  title: (theme: Theme) => ({
    ...theme.mixins.maxLine({ line: 1 }),
    flex: "1 1 auto",
  }),
  info: {
    fontSize: 12,
    flexShrink: 0,
    fontWeight: 600,
    marginLeft: "6px",
    lineHeight: 18 / 12,
    display: "inline-flex",
  },
  arrow: (theme: Theme) => ({
    width: 16,
    height: 16,
    flexShrink: 0,
    marginLeft: "6px",
    display: "inline-flex",
    ...(theme.direction === "rtl" && { transform: "scaleX(-1)" }),
  }),
  captionIcon: { width: 16, height: 16 },
  captionText: (theme: Theme) => ({
    ...theme.mixins.maxLine({ line: 1 }),
    ...theme.typography.caption,
  }),
  disabled: { opacity: 0.48, pointerEvents: "none" },
};
