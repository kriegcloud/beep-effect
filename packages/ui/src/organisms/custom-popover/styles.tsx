import { rgbaFromChannel } from "@beep/ui/utils";
import type { CSSObject, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type { PopoverArrow } from "./types";

const centerStyles: Record<string, CSSObject> = {
  hCenter: { left: 0, right: 0, margin: "auto" },
  vCenter: { top: 0, bottom: 0, margin: "auto" },
};

const getRtlPosition = (position: "left" | "right", isRtl: boolean, value: number): CSSObject => ({
  [position]: isRtl ? "auto" : value,
  [position === "left" ? "right" : "left"]: isRtl ? value : "auto",
});

const createBackgroundStyles = (theme: Theme, color: "cyan" | "red", size: number): CSSObject => {
  const colorChannel = theme.vars.palette[color === "cyan" ? "info" : "error"].mainChannel;

  return {
    backgroundRepeat: "no-repeat",
    backgroundSize: `${size * 3}px ${size * 3}px`,
    backgroundColor: theme.vars.palette.background.paper,
    backgroundPosition: color === "cyan" ? "top right" : "bottom left",
    backgroundImage: `linear-gradient(45deg, ${rgbaFromChannel(colorChannel, 0.1)}, ${rgbaFromChannel(colorChannel, 0.1)})`,
  };
};

const arrowDirection: Record<string, CSSObject> = {
  top: { top: 0, rotate: "135deg", translate: "0 -50%" },
  bottom: { bottom: 0, rotate: "-45deg", translate: "0 50%" },
  left: { rotate: "45deg", translate: "-50% 0" },
  right: { rotate: "-135deg", translate: "50% 0" },
};

export const Arrow = styled("span", {
  shouldForwardProp: (prop: string) => !["size", "placement", "offset", "sx"].includes(prop),
})<PopoverArrow>(({ offset = 0, size = 0, theme }) => {
  const isRtl = theme.direction === "rtl";

  const cyanBackgroundStyles = createBackgroundStyles(theme, "cyan", size);
  const redBackgroundStyles = createBackgroundStyles(theme, "red", size);

  return {
    width: size,
    height: size,
    position: "absolute",
    backdropFilter: "6px",
    borderBottomLeftRadius: size / 4,
    clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)",
    backgroundColor: theme.vars.palette.background.paper,
    border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12)}`,
    ...theme.applyStyles("dark", {
      border: `solid 1px ${rgbaFromChannel(theme.vars.palette.common.blackChannel, 0.12)}`,
    }),

    variants: [
      /**
       * @position top*
       */
      {
        props: ({ placement }) => placement?.startsWith("top-"),
        style: { ...arrowDirection.top },
      },
      {
        props: { placement: "top-left" },
        style: { ...getRtlPosition("left", isRtl, offset) },
      },
      {
        props: { placement: "top-center" },
        style: { ...centerStyles.hCenter },
      },
      {
        props: { placement: "top-right" },
        style: { ...getRtlPosition("right", isRtl, offset), ...cyanBackgroundStyles },
      },
      /**
       * @position bottom*
       */
      {
        props: ({ placement }) => placement?.startsWith("bottom-"),
        style: { ...arrowDirection.bottom },
      },
      {
        props: { placement: "bottom-left" },
        style: { ...getRtlPosition("left", isRtl, offset), ...redBackgroundStyles },
      },
      {
        props: { placement: "bottom-center" },
        style: { ...centerStyles.hCenter },
      },
      {
        props: { placement: "bottom-right" },
        style: { ...getRtlPosition("right", isRtl, offset) },
      },
      /**
       * @position left*
       */
      {
        props: ({ placement }) => placement?.startsWith("left-"),
        style: { ...getRtlPosition("left", isRtl, 0), ...arrowDirection.left },
      },
      {
        props: { placement: "left-top" },
        style: { top: offset },
      },
      {
        props: { placement: "left-center" },
        style: { ...centerStyles.vCenter, ...redBackgroundStyles },
      },
      {
        props: { placement: "left-bottom" },
        style: { ...redBackgroundStyles, bottom: offset },
      },
      /**
       * @position right*
       */
      {
        props: ({ placement }) => placement?.startsWith("right-"),
        style: { ...getRtlPosition("right", isRtl, 0), ...arrowDirection.right },
      },
      {
        props: { placement: "right-top" },
        style: { ...cyanBackgroundStyles, top: offset },
      },
      {
        props: { placement: "right-center" },
        style: { ...centerStyles.vCenter, ...cyanBackgroundStyles },
      },
      {
        props: { placement: "right-bottom" },
        style: { bottom: offset },
      },
    ],
  };
});
