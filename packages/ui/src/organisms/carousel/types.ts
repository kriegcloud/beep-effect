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
  readonly disablePrev: boolean;
  readonly disableNext: boolean;
  readonly onClickPrev: () => void;
  readonly onClickNext: () => void;
};

export type CarouselArrowButtonProps = ButtonBaseProps & {
  readonly svgSize?: number | undefined;
  readonly variant: "prev" | "next";
  readonly svgIcon?: React.ReactNode | undefined;
  readonly options?: CarouselArrowButtonsProps["options"] | undefined;
};

export type CarouselArrowButtonsProps = React.ComponentProps<"div"> &
  UseCarouselArrowsReturn & {
    readonly sx?: SxProps<Theme> | undefined;
    readonly totalSlides?: number | undefined;
    readonly selectedIndex?: number | undefined;
    readonly options?: Partial<CarouselOptions> | undefined;
    readonly slotProps?:
      | {
          readonly prevBtn?:
            | (Pick<CarouselArrowButtonProps, "svgIcon" | "svgSize"> & {
                readonly sx?: SxProps<Theme> | undefined;
              })
            | undefined;
          readonly nextBtn?:
            | (Pick<CarouselArrowButtonProps, "svgIcon" | "svgSize"> & {
                readonly sx?: SxProps<Theme> | undefined;
              })
            | undefined;
        }
      | undefined;
  };

/**
 * Thumbs
 */
export type UseCarouselThumbsReturn = {
  readonly selectedIndex: number;
  readonly thumbsApi?: EmblaCarouselType | undefined;
  readonly thumbsRef: UseEmblaCarouselType[0];
  readonly onClickThumb: (index: number) => void;
};

export type CarouselThumbProps = ButtonBaseProps & {
  readonly src: string;
  readonly index: number;
  readonly selected: boolean;
};

export type CarouselThumbsProps = React.ComponentProps<"div"> & {
  readonly options?: Partial<CarouselOptions>;
  readonly sx?: SxProps<Theme> | undefined;
  readonly slotProps?: {
    readonly slide?: SxProps<Theme> | undefined;
    readonly container?: SxProps<Theme> | undefined;
    readonly disableMask?: boolean | undefined;
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
