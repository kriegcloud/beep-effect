"use client";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { CarouselOptions, UseCarouselThumbsReturn } from "../types";

export function useThumbs(mainApi?: EmblaCarouselType, options?: Partial<CarouselOptions>): UseCarouselThumbsReturn {
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    ...options,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onClickThumb = useCallback(
    (index: number) => {
      if (!mainApi || !thumbsApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbsApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbsApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
  }, [mainApi, onSelect]);

  return {
    onClickThumb,
    thumbsRef,
    thumbsApi,
    selectedIndex,
  };
}
