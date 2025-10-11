"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import { styled } from "@mui/material/styles";
import { Children, isValidElement } from "react";
import { carouselClasses } from "../classes";
import type { CarouselOptions, CarouselThumbsProps } from "../types";
import { CarouselSlide } from "./carousel-slide";

export function CarouselThumbs({ sx, options, children, slotProps, className, ...other }: CarouselThumbsProps) {
  const axis = options?.axis ?? "x";
  const slideSpacing = options?.slideSpacing ?? "12px";

  const renderChildren = () =>
    Children.map(children, (child) => {
      if (isValidElement(child)) {
        const reactChild = child as React.ReactElement<{ key?: React.Key }>;

        return (
          <CarouselSlide key={reactChild.key} options={{ ...options, slideSpacing }} sx={slotProps?.slide}>
            {child}
          </CarouselSlide>
        );
      }
      return null;
    });

  return (
    <ThumbsRoot
      axis={axis}
      enableMask={!slotProps?.disableMask}
      className={mergeClasses([carouselClasses.thumbs.root, className])}
      sx={sx}
      {...other}
    >
      <ThumbsContainer
        axis={axis}
        slideSpacing={slideSpacing}
        className={carouselClasses.thumbs.container}
        sx={slotProps?.container}
      >
        {renderChildren()}
      </ThumbsContainer>
    </ThumbsRoot>
  );
}

type ThumbsRootProps = Pick<CarouselOptions, "axis"> & {
  enableMask?: boolean;
};

const ThumbsRoot = styled("div", {
  shouldForwardProp: (prop: string) => !["axis", "enableMask", "sx"].includes(prop),
})<ThumbsRootProps>(({ enableMask, theme }) => {
  const maskBg = `${theme.vars.palette.background.paper} 20%, transparent 100%)`;

  return {
    flexShrink: 0,
    margin: "auto",
    maxWidth: "100%",
    overflow: "hidden",
    position: "relative",
    variants: [
      {
        props: { axis: "x" },
        style: {
          maxWidth: "100%",
          padding: theme.spacing(0.5),
          ...(enableMask && {
            "&::before, &::after": {
              top: 0,
              zIndex: 9,
              width: 40,
              content: '""',
              height: "100%",
              position: "absolute",
            },
            "&::before": { left: -8, background: `linear-gradient(to right, ${maskBg}` },
            "&::after": { right: -8, background: `linear-gradient(to left, ${maskBg}` },
          }),
        },
      },
      {
        props: { axis: "y" },
        style: {
          height: "100%",
          maxHeight: "100%",
          padding: theme.spacing(0.5),
          ...(enableMask && {
            "&::before, &::after": {
              left: 0,
              zIndex: 9,
              height: 40,
              content: '""',
              width: "100%",
              position: "absolute",
            },
            "&::before": { top: -8, background: `linear-gradient(to bottom, ${maskBg}` },
            "&::after": { bottom: -8, background: `linear-gradient(to top, ${maskBg}` },
          }),
        },
      },
    ],
  };
});

type ThumbsContainerProps = Pick<CarouselOptions, "axis" | "slideSpacing">;

const ThumbsContainer = styled("ul", {
  shouldForwardProp: (prop: string) => !["axis", "slideSpacing", "sx"].includes(prop),
})<ThumbsContainerProps>(({ slideSpacing }) => ({
  display: "flex",
  backfaceVisibility: "hidden",
  variants: [
    {
      props: { axis: "x" },
      style: {
        touchAction: "pan-y pinch-zoom",
        marginLeft: `calc(${slideSpacing} * -1)`,
      },
    },
    {
      props: { axis: "y" },
      style: {
        height: "100%",
        flexDirection: "column",
        touchAction: "pan-x pinch-zoom",
        marginTop: `calc(${slideSpacing} * -1)`,
      },
    },
  ],
}));
