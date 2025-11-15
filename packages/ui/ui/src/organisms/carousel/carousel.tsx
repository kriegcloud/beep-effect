"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import { styled } from "@mui/material/styles";
import { Children, isValidElement } from "react";
import { carouselClasses } from "./classes";
import { CarouselSlide } from "./components/carousel-slide";
import type { CarouselOptions, CarouselProps } from "./types";

export function Carousel({ sx, carousel, children, slotProps, className, ...other }: CarouselProps) {
  const { mainRef, options } = carousel;

  const axis = options?.axis ?? "x";
  const slideSpacing = options?.slideSpacing ?? "0px";

  const renderChildren = () =>
    Children.map(children, (child) => {
      if (isValidElement(child)) {
        const reactChild = child as React.ReactElement<{ key?: React.Key }>;

        return (
          <CarouselSlide key={reactChild.key} options={carousel.options ?? {}} sx={slotProps?.slide ?? {}}>
            {child}
          </CarouselSlide>
        );
      }
      return null;
    });

  return (
    <CarouselRoot
      sx={sx ?? {}}
      ref={mainRef}
      axis={axis}
      className={mergeClasses([carouselClasses.root, className])}
      {...other}
    >
      <CarouselContainer
        axis={axis}
        slideSpacing={slideSpacing}
        className={carouselClasses.container}
        sx={[
          (theme) => ({
            ...(carousel.pluginNames?.includes("autoHeight") && {
              alignItems: "flex-start",
              transition: theme.transitions.create(["height"], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
            }),
          }),
          ...(Array.isArray(slotProps?.container) ? slotProps.container : [slotProps?.container]),
        ]}
      >
        {renderChildren()}
      </CarouselContainer>
    </CarouselRoot>
  );
}

const CarouselRoot = styled("div", {
  shouldForwardProp: (prop: string) => !["axis", "sx"].includes(prop),
})<Pick<CarouselOptions, "axis">>(() => ({
  margin: "auto",
  maxWidth: "100%",
  overflow: "hidden",
  position: "relative",
  variants: [{ props: { axis: "y" }, style: { height: "100%" } }],
}));

const CarouselContainer = styled("ul", {
  shouldForwardProp: (prop: string) => !["axis", "slideSpacing", "sx"].includes(prop),
})<Pick<CarouselOptions, "axis" | "slideSpacing">>(({ slideSpacing }) => ({
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
