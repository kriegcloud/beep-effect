"use client";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";
import type { UseCarouselProgressReturn } from "../types";

export function useCarouselProgress(mainApi?: EmblaCarouselType): UseCarouselProgressReturn {
  const [progressValue, setProgressValue] = useState<number>(0);

  const handleScroll = useCallback((carouselApi: EmblaCarouselType) => {
    const rawProgress = carouselApi.scrollProgress();
    const normalizedProgress = Math.max(0, Math.min(1, rawProgress));

    setProgressValue(normalizedProgress * 100);
  }, []);

  useEffect(() => {
    if (!mainApi) return;

    handleScroll(mainApi);
    mainApi.on("reInit", handleScroll).on("scroll", handleScroll).on("slideFocus", handleScroll);
  }, [mainApi, handleScroll]);

  return {
    value: progressValue,
  };
}
