"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { CSSObject } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { carouselClasses } from "../classes";
import type { CarouselDotButtonsProps } from "../types";

const DOT_SIZES = { circular: 8, rounded: 8, number: 28 } as const;
const DOT_GAPS = { rounded: 2, circular: 2, number: 6 } as const;
const OUTER_PADDING = 12;

export function CarouselDotButtons({
  sx,
  gap,
  slotProps,
  className,
  onClickDot,
  scrollSnaps,
  selectedIndex,
  variant = "circular",
  ...other
}: CarouselDotButtonsProps) {
  const dotGap = gap ?? DOT_GAPS[variant];
  const dotSize = slotProps?.dot?.size ?? DOT_SIZES[variant];
  const listItemHeight = variant === "number" ? dotSize : dotSize + OUTER_PADDING;

  return (
    <Box
      component="ul"
      className={mergeClasses([carouselClasses.dots.root, className])}
      sx={[
        {
          zIndex: 9,
          display: "flex",
          gap: `${dotGap}px`,
          height: listItemHeight,
          "& > li": { display: "inline-flex" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {scrollSnaps.map((_, index) => {
        const isSelected = index === selectedIndex;

        return (
          <li key={index}>
            <DotItem
              disableRipple
              aria-label={`dot-${index}`}
              size={dotSize}
              variant={variant}
              selected={isSelected}
              className={mergeClasses(carouselClasses.dots.item, {
                [carouselClasses.dots.itemSelected]: isSelected,
              })}
              onClick={() => onClickDot(index)}
              sx={slotProps?.dot?.sx ?? {}}
            >
              {variant === "number" && index + 1}
            </DotItem>
          </li>
        );
      })}
    </Box>
  );
}

type DotItemProps = Pick<CarouselDotButtonsProps, "variant"> & {
  selected?: boolean;
  size?: number;
};

const DotItem = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !["size", "variant", "selected", "sx"].includes(prop),
})<DotItemProps>(({ size = 0, selected, theme }) => {
  const wrapperSize = size + OUTER_PADDING;

  const dotBaseStyles: CSSObject = {
    width: size,
    height: size,
    content: '""',
    opacity: 0.24,
    backgroundColor: "currentColor",
    transition: theme.transitions.create(["width", "opacity"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter,
    }),
  };

  return {
    variants: [
      {
        props: { variant: "circular" },
        style: () => ({
          width: wrapperSize,
          height: wrapperSize,
          "&::before": {
            ...dotBaseStyles,
            borderRadius: "50%",
            ...(selected && { opacity: 1 }),
          },
        }),
      },
      {
        props: { variant: "rounded" },
        style: () => ({
          width: wrapperSize,
          height: wrapperSize,
          "&::before": {
            ...dotBaseStyles,
            borderRadius: size / 2,
            ...(selected && { opacity: 1, width: "calc(100% - 4px)" }),
          },
        }),
      },
      {
        props: { variant: "number" },
        style: {
          width: size,
          height: size,
          borderRadius: "50%",
          ...theme.typography.body2,
          color: theme.vars.palette.text.disabled,
          border: `solid 1px ${theme.vars.palette.shared.buttonOutlined}`,
          ...(selected && {
            ...theme.mixins.filledStyles(theme, "inherit"),
            fontWeight: theme.typography.fontWeightSemiBold,
            borderColor: "transparent",
          }),
        },
      },
    ],
  };
});
