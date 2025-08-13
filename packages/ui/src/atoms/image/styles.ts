import type { CSSObject } from "@mui/material/styles";

import { styled } from "@mui/material/styles";

import { imageClasses } from "./classes";

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iNTAlIiBjeT0iNDYuODAxMTAyJSIgcj0iOTUuNDk3MTEyJSI+CiAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMCIgLz4KICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzkxOWVhYiIgc3RvcC1vcGFjaXR5PSIuNDgiIC8+CiAgPC9yYWRpYWxHcmFkaWVudD4KICA8cGF0aCBkPSJtODggODZoNTEydjUxMmgtNTEyeiIgZmlsbD0idXJsKCNhKSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODggLTg2KSIgLz4KPC9zdmc+Cg==";

const sharedStyles: CSSObject = {
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "inherit",
  aspectRatio: "inherit",
  borderRadius: "inherit",
};

export const ImageRoot = styled("span", {
  shouldForwardProp: (prop: string) => !["effect", "sx"].includes(prop),
})<{ effect?: EffectsType }>(({ effect }) => ({
  maxWidth: "100%",
  overflow: "hidden",
  position: "relative",
  display: "inline-block",
  verticalAlign: "bottom",
  aspectRatio: "var(--aspect-ratio)",
  ...(effect && getEffectStyles(effect)),
}));

export const ImageImg = styled("img")(() => ({
  ...sharedStyles,
  objectFit: "cover",
}));

export const ImageOverlay = styled("span")({
  ...sharedStyles,
  zIndex: 1,
  position: "absolute",
});

export const ImagePlaceholder = styled("span")({
  ...sharedStyles,
  content: '""',
  position: "absolute",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundImage: `url(${placeholderImage})`,
});

export type EffectsType = {
  duration?: number;
  disabled?: boolean;
  style?: "blur" | "black-and-white" | "opacity";
};

const getEffectStyles = (effect?: EffectsType) => {
  const { style, duration } = effect ?? {};

  const transition =
    style === "opacity"
      ? `opacity ${duration}ms`
      : `opacity ${Number(duration) / 2}ms, filter ${duration}ms`;

  return {
    [`& .${imageClasses.img}`]: {
      transition,
      ...(style === "opacity" && { opacity: 0 }),
      ...(style === "blur" && { filter: "blur(12px)", opacity: 0 }),
      ...(style === "black-and-white" && {
        filter: "grayscale(1)",
        opacity: 0,
      }),
    },
    [`&.${imageClasses.state.loaded} .${imageClasses.img}`]: {
      ...(style === "opacity" && { opacity: 1 }),
      ...(style === "blur" && { filter: "blur(0)", opacity: 1 }),
      ...(style === "black-and-white" && {
        filter: "grayscale(0)",
        opacity: 1,
      }),
    },
  };
};
