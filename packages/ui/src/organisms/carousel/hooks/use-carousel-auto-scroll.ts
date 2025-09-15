"use client";
import type { EmblaCarouselType } from "embla-carousel";
import type {} from "embla-carousel-auto-scroll";
import { useCallback, useEffect, useState } from "react";
import type { UseCarouselAutoplayReturn } from "../types";

export function useCarouselAutoScroll(mainApi?: EmblaCarouselType): UseCarouselAutoplayReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleClickPlay = useCallback(
    (callback: () => void) => {
      const autoScroll = mainApi?.plugins()?.autoScroll;
      if (!autoScroll) return;

      const resetOrStop = autoScroll.options.stopOnInteraction === false ? autoScroll.reset : autoScroll.stop;

      resetOrStop();
      callback();
    },
    [mainApi]
  );

  const handleTogglePlay = useCallback(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    const playOrStop = autoScroll.isPlaying() ? autoScroll.stop : autoScroll.play;
    playOrStop();
  }, [mainApi]);

  useEffect(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    setIsPlaying(autoScroll.isPlaying());
    mainApi
      .on("autoScroll:play", () => setIsPlaying(true))
      .on("autoScroll:stop", () => setIsPlaying(false))
      .on("reInit", () => setIsPlaying(autoScroll.isPlaying()));
  }, [mainApi]);

  return {
    isPlaying,
    onClickPlay: handleClickPlay,
    onTogglePlay: handleTogglePlay,
  };
}
