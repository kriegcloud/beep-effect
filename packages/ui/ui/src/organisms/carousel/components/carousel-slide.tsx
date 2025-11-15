"use client";
import { mergeClasses } from "@beep/ui-core/utils";
import { styled } from "@mui/material/styles";
import { carouselClasses } from "../classes";
import type { CarouselOptions, CarouselSlideProps } from "../types";
import { getSlideSize } from "../utils";

export function CarouselSlide({ sx, options, children, className, ...other }: CarouselSlideProps) {
  const slideSize = getSlideSize(options?.slidesToShow);

  return (
    <CarouselSlideRoot
      axis={options?.axis ?? "x"}
      {...(options?.slideSpacing ? { slideSpacing: options.slideSpacing } : {})}
      className={mergeClasses([carouselClasses.slide.root, className])}
      sx={[{ flex: slideSize }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      {options?.parallax ? (
        <div className={carouselClasses.slide.content}>
          <div className={carouselClasses.slide.parallax}>{children}</div>
        </div>
      ) : (
        children
      )}
    </CarouselSlideRoot>
  );
}

const CarouselSlideRoot = styled("li", {
  shouldForwardProp: (prop: string) => !["axis", "slideSpacing", "sx"].includes(prop),
})<Pick<CarouselOptions, "axis" | "slideSpacing">>(({ slideSpacing }) => ({
  display: "block",
  position: "relative",
  [`& .${carouselClasses.slide.content}`]: {
    overflow: "hidden",
    position: "relative",
    borderRadius: "inherit",
  },
  variants: [
    { props: { axis: "x" }, style: { minWidth: 0, paddingLeft: slideSpacing } },
    { props: { axis: "y" }, style: { minHeight: 0, paddingTop: slideSpacing } },
  ],
}));
