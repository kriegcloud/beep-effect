"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import ButtonBase from "@mui/material/ButtonBase";

import SvgIcon from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import { carouselClasses } from "../classes";
import type { CarouselArrowButtonProps, CarouselOptions } from "../types";

const prevSvgPath = (
  <path
    fill="currentColor"
    fillRule="evenodd"
    d="M15.488 4.43a.75.75 0 0 1 .081 1.058L9.988 12l5.581 6.512a.75.75 0 1 1-1.138.976l-6-7a.75.75 0 0 1 0-.976l6-7a.75.75 0 0 1 1.057-.081"
    clipRule="evenodd"
  />
);

const nextSvgPath = (
  <path
    fill="currentColor"
    fillRule="evenodd"
    d="M8.512 4.43a.75.75 0 0 1 1.057.082l6 7a.75.75 0 0 1 0 .976l-6 7a.75.75 0 0 1-1.138-.976L14.012 12L8.431 5.488a.75.75 0 0 1 .08-1.057"
    clipRule="evenodd"
  />
);

export function ArrowButton({
  sx,
  svgIcon,
  options,
  variant,
  className,
  svgSize = 20,
  ...other
}: CarouselArrowButtonProps) {
  const isPrev = variant === "prev";

  const svgContent = svgIcon || (isPrev ? prevSvgPath : nextSvgPath);

  return (
    <ArrowButtonRoot
      axis={options?.axis}
      direction={options?.direction}
      aria-label={isPrev ? "Prev button" : "Next button"}
      className={mergeClasses([carouselClasses.arrows[isPrev ? "prev" : "next"], className])}
      sx={sx}
      {...other}
    >
      <SvgIcon className={carouselClasses.arrows.svg} sx={{ width: svgSize, height: svgSize }}>
        {svgContent}
      </SvgIcon>
    </ArrowButtonRoot>
  );
}

const ArrowButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !["axis", "direction", "sx"].includes(prop),
})<Pick<CarouselOptions, "axis" | "direction">>(({ theme }) => ({
  borderRadius: "50%",
  boxSizing: "content-box",
  padding: theme.spacing(1),
  transition: theme.transitions.create(["all"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.short,
  }),
  variants: [
    { props: { disabled: true }, style: { opacity: 0.4 } },
    {
      props: { axis: "y" },
      style: { [`& .${carouselClasses.arrows.svg}`]: { transform: "rotate(90deg)" } },
    },
    {
      props: { direction: "rtl" },
      style: { [`& .${carouselClasses.arrows.svg}`]: { transform: "scaleX(-1)" } },
    },
  ],
}));
