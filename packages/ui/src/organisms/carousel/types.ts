import type { BoxProps } from "@mui/material/Box";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { Breakpoint, SxProps, Theme } from "@mui/material/styles";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import type { UseEmblaCarouselType } from "embla-carousel-react";

/**
 * Dot buttons
 */
export type UseCarouselDotsReturn = {
  dotCount: number;
  selectedIndex: number;
  scrollSnaps: number[];
  onClickDot: (index: number) => void;
};

export type CarouselDotButtonsProps = BoxProps<"ul"> &
  Omit<UseCarouselDotsReturn, "dotCount"> & {
    gap?: number;
    variant?: "circular" | "rounded" | "number";
    slotProps?: {
      dot?: {
        size?: number;
        sx?: SxProps<Theme>;
      };
    };
  };

/**
 * Prev & next buttons
 */
export type UseCarouselArrowsReturn = {
  disablePrev: boolean;
  disableNext: boolean;
  onClickPrev: () => void;
  onClickNext: () => void;
};

export type CarouselArrowButtonProps = ButtonBaseProps & {
  svgSize?: number;
  variant: "prev" | "next";
  svgIcon?: React.ReactNode;
  options?: CarouselArrowButtonsProps["options"];
};

export type CarouselArrowButtonsProps = React.ComponentProps<"div"> &
  UseCarouselArrowsReturn & {
    sx?: SxProps<Theme>;
    totalSlides?: number;
    selectedIndex?: number;
    options?: Partial<CarouselOptions>;
    slotProps?: {
      prevBtn?: Pick<CarouselArrowButtonProps, "svgIcon" | "svgSize"> & {
        sx?: SxProps<Theme>;
      };
      nextBtn?: Pick<CarouselArrowButtonProps, "svgIcon" | "svgSize"> & {
        sx?: SxProps<Theme>;
      };
    };
  };

/**
 * Thumbs
 */
export type UseCarouselThumbsReturn = {
  selectedIndex: number;
  thumbsApi?: EmblaCarouselType;
  thumbsRef: UseEmblaCarouselType[0];
  onClickThumb: (index: number) => void;
};

export type CarouselThumbProps = ButtonBaseProps & {
  src: string;
  index: number;
  selected: boolean;
};

export type CarouselThumbsProps = React.ComponentProps<"div"> & {
  options?: Partial<CarouselOptions>;
  sx?: SxProps<Theme>;
  slotProps?: {
    slide?: SxProps<Theme>;
    container?: SxProps<Theme>;
    disableMask?: boolean;
  };
};

/**
 * Progress
 */
export type UseCarouselProgressReturn = {
  value: number;
};

export type CarouselProgressBarProps = React.ComponentProps<"div"> &
  UseCarouselProgressReturn & {
    sx?: SxProps<Theme>;
  };

/**
 * Autoplay
 */
export type UseCarouselAutoplayReturn = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClickPlay: (callback: () => void) => void;
};

/**
 * Slide
 */
export type CarouselSlideProps = React.ComponentProps<"li"> & {
  options?: Partial<CarouselOptions>;
  sx?: SxProps<Theme>;
};

/**
 * Carousel
 */
export type CarouselBaseOptions = EmblaOptionsType & {
  slideSpacing?: string;
  parallax?: boolean | number;
  slidesToShow?: string | number | Partial<Record<Breakpoint, string | number>>;
};

export type CarouselOptions = CarouselBaseOptions & {
  thumbs?: CarouselBaseOptions;
  breakpoints?: {
    [key: string]: Omit<CarouselBaseOptions, "slidesToShow">;
  };
};

export type UseCarouselReturn = {
  pluginNames?: string[];
  options?: CarouselOptions;
  mainRef: UseEmblaCarouselType[0];
  mainApi?: EmblaCarouselType;
  thumbs: UseCarouselThumbsReturn;
  dots: UseCarouselDotsReturn;
  autoplay: UseCarouselAutoplayReturn;
  progress: UseCarouselProgressReturn;
  autoScroll: UseCarouselAutoplayReturn;
  arrows: UseCarouselArrowsReturn;
};

export type CarouselProps = React.ComponentProps<"div"> & {
  sx?: SxProps<Theme>;
  carousel: UseCarouselReturn;
  slotProps?: {
    container?: SxProps<Theme>;
    slide?: SxProps<Theme>;
  };
};
