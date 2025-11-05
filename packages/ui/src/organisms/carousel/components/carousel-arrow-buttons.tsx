"use client";

import { mergeClasses, rgbaFromChannel } from "@beep/ui-core/utils";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { carouselClasses } from "../classes";
import type { CarouselArrowButtonsProps } from "../types";
import { ArrowButton } from "./arrow-button";

const BasicButtonsRoot = styled("div")(({ theme }) => ({
  gap: "4px",
  zIndex: 9,
  alignItems: "center",
  display: "inline-flex",
  color: theme.vars.palette.action.active,
}));

export function CarouselArrowBasicButtons({
  sx,
  options,
  slotProps,
  onClickPrev,
  onClickNext,
  disablePrev,
  disableNext,
  className,
  ...other
}: CarouselArrowButtonsProps) {
  return (
    <BasicButtonsRoot className={mergeClasses([carouselClasses.arrows.root, className])} sx={sx ?? {}} {...other}>
      <ArrowButton
        variant="prev"
        options={options}
        disabled={disablePrev}
        onClick={onClickPrev}
        svgIcon={slotProps?.prevBtn?.svgIcon}
        svgSize={slotProps?.prevBtn?.svgSize}
        sx={slotProps?.prevBtn?.sx ?? {}}
      />

      <ArrowButton
        variant="next"
        options={options}
        disabled={disableNext}
        onClick={onClickNext}
        svgIcon={slotProps?.nextBtn?.svgIcon}
        svgSize={slotProps?.nextBtn?.svgSize}
        sx={slotProps?.nextBtn?.sx ?? {}}
      />
    </BasicButtonsRoot>
  );
}

export function CarouselArrowFloatButtons({
  sx,
  options,
  slotProps,
  onClickPrev,
  onClickNext,
  disablePrev,
  disableNext,
}: CarouselArrowButtonsProps) {
  const baseStyles = (theme: Theme) => ({
    zIndex: 9,
    top: "50%",
    borderRadius: 1.5,
    position: "absolute",
    color: "common.white",
    bgcolor: "text.primary",
    "&:hover": { opacity: 0.8 },
    ...theme.applyStyles("dark", {
      color: "grey.800",
    }),
  });

  return (
    <>
      <ArrowButton
        variant="prev"
        options={options}
        disabled={disablePrev}
        onClick={onClickPrev}
        svgIcon={slotProps?.prevBtn?.svgIcon}
        svgSize={slotProps?.prevBtn?.svgSize}
        sx={[
          (theme) => ({
            ...baseStyles(theme),
            left: 0,
            transform: "translate(-50%, -50%)",
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
          ...(Array.isArray(slotProps?.prevBtn?.sx) ? slotProps.prevBtn.sx : [slotProps?.prevBtn?.sx]),
        ]}
      />

      <ArrowButton
        variant="next"
        options={options}
        disabled={disableNext}
        onClick={onClickNext}
        svgIcon={slotProps?.nextBtn?.svgIcon}
        svgSize={slotProps?.nextBtn?.svgSize}
        sx={[
          (theme) => ({
            ...baseStyles(theme),
            right: 0,
            transform: "translate(50%, -50%)",
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
          ...(Array.isArray(slotProps?.nextBtn?.sx) ? slotProps.nextBtn.sx : [slotProps?.nextBtn?.sx]),
        ]}
      />
    </>
  );
}

const NumberButtonsRoot = styled("div")(({ theme }) => ({
  gap: "2px",
  zIndex: 9,
  alignItems: "center",
  display: "inline-flex",
  padding: theme.spacing(0.5),
  color: theme.vars.palette.common.white,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.48),
  [`& .${carouselClasses.arrows.label}`]: {
    ...theme.typography.subtitle2,
    margin: theme.spacing(0, 0.5),
  },
  [`& .${carouselClasses.arrows.prev}`]: {
    borderRadius: "inherit",
    padding: theme.spacing(0.75),
  },
  [`& .${carouselClasses.arrows.next}`]: {
    borderRadius: "inherit",
    padding: theme.spacing(0.75),
  },
}));

export function CarouselArrowNumberButtons({
  sx,
  options,
  slotProps,
  className,
  totalSlides,
  onClickPrev,
  onClickNext,
  disablePrev,
  disableNext,
  selectedIndex,
  ...other
}: CarouselArrowButtonsProps) {
  return (
    <NumberButtonsRoot className={mergeClasses([carouselClasses.arrows.root, className])} sx={sx ?? {}} {...other}>
      <ArrowButton
        variant="prev"
        options={options}
        disabled={disablePrev}
        onClick={onClickPrev}
        svgIcon={slotProps?.prevBtn?.svgIcon}
        svgSize={slotProps?.prevBtn?.svgSize ?? 16}
        sx={slotProps?.prevBtn?.sx ?? {}}
      />

      <span className={carouselClasses.arrows.label}>
        {selectedIndex}/{totalSlides}
      </span>

      <ArrowButton
        variant="next"
        options={options}
        disabled={disableNext}
        onClick={onClickNext}
        svgIcon={slotProps?.nextBtn?.svgIcon}
        svgSize={slotProps?.nextBtn?.svgSize ?? 16}
        sx={slotProps?.nextBtn?.sx ?? {}}
      />
    </NumberButtonsRoot>
  );
}
