"use client";

import { Button } from "@beep/ui/components/button";
import { A } from "@beep/utils";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import * as React from "react";
import { cn } from "../lib/index.ts";
import { requireReactContext } from "../lib/react-invariant.ts";

/**
 * Carousel api type.
 *
 * @example
 * ```ts
 * import type { CarouselApi } from "@beep/ui/components/carousel"
 *
 * const value = {} as CarouselApi
 * console.log(value)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  readonly opts?: undefined | CarouselOptions;
  readonly plugins?: undefined | CarouselPlugin;
  readonly orientation?: undefined | "horizontal" | "vertical";
  readonly setApi?: ((api: CarouselApi) => void) | undefined;
};

type CarouselContextProps = {
  readonly carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  readonly api: ReturnType<typeof useEmblaCarousel>[1];
  readonly scrollPrev: () => void;
  readonly scrollNext: () => void;
  readonly canScrollPrev: boolean;
  readonly canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

/**
 * Use carousel hook.
 *
 * @example
 * ```tsx
 * import { useCarousel } from "@beep/ui/components/carousel"
 *
 * console.log(useCarousel)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
function useCarousel() {
  const context = React.useContext(CarouselContext);
  return requireReactContext(context, { message: "useCarousel must be used within a <Carousel />" });
}

/**
 * Carousel component.
 *
 * @example
 * ```tsx
 * import { Carousel } from "@beep/ui/components/carousel"
 *
 * console.log(Carousel)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (api === undefined) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, A.empty());

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), A.make(api));

  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(
    () => {
      if (api === undefined || setApi === undefined) return;
      setApi(api);
    },
    A.make(api, setApi)
  );

  React.useEffect(
    () => {
      if (api === undefined) return;
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
        api?.off("reInit", onSelect);
      };
    },
    A.make(api, onSelect)
  );

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

/**
 * Carousel content component.
 *
 * @example
 * ```tsx
 * import { CarouselContent } from "@beep/ui/components/carousel"
 *
 * console.log(CarouselContent)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  );
}

/**
 * Carousel item component.
 *
 * @example
 * ```tsx
 * import { CarouselItem } from "@beep/ui/components/carousel"
 *
 * console.log(CarouselItem)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      {...props}
    />
  );
}

/**
 * Carousel previous component.
 *
 * @example
 * ```tsx
 * import { CarouselPrevious } from "@beep/ui/components/carousel"
 *
 * console.log(CarouselPrevious)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "rounded-full absolute touch-manipulation",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <CaretLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

/**
 * Carousel next component.
 *
 * @example
 * ```tsx
 * import { CarouselNext } from "@beep/ui/components/carousel"
 *
 * console.log(CarouselNext)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "rounded-full absolute touch-manipulation",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <CaretRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel };
