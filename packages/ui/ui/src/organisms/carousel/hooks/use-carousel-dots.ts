"use client";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";
import type { UseCarouselDotsReturn } from "../types";

export function useCarouselDots(mainApi?: EmblaCarouselType): UseCarouselDotsReturn {
  const [dotCount, setDotCount] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const handleClickDot = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi]
  );

  const handleInit = useCallback((carouselApi: EmblaCarouselType) => {
    setScrollSnaps(carouselApi.scrollSnapList());
  }, []);

  const handleSelect = useCallback((carouselApi: EmblaCarouselType) => {
    setSelectedIndex(carouselApi.selectedScrollSnap());
    setDotCount(carouselApi.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!mainApi) return;

    handleInit(mainApi);
    handleSelect(mainApi);
    mainApi.on("reInit", handleInit).on("reInit", handleSelect).on("select", handleSelect);
  }, [mainApi, handleInit, handleSelect]);

  return {
    dotCount,
    scrollSnaps,
    selectedIndex,
    onClickDot: handleClickDot,
  };
}
