"use client";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";
import type { UseCarouselArrowsReturn } from "../types";

export function useCarouselArrows(mainApi?: EmblaCarouselType): UseCarouselArrowsReturn {
  const [disablePrev, setDisabledPrevBtn] = useState<boolean>(true);
  const [disableNext, setDisabledNextBtn] = useState<boolean>(true);

  const handleClickPrev = useCallback(() => {
    if (!mainApi) return;
    mainApi.scrollPrev();
  }, [mainApi]);

  const handleClickNext = useCallback(() => {
    if (!mainApi) return;
    mainApi.scrollNext();
  }, [mainApi]);

  const updateArrowState = useCallback((carouselApi: EmblaCarouselType) => {
    setDisabledPrevBtn(!carouselApi.canScrollPrev());
    setDisabledNextBtn(!carouselApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!mainApi) return;

    updateArrowState(mainApi);
    mainApi.on("reInit", updateArrowState).on("select", updateArrowState);
  }, [mainApi, updateArrowState]);

  return {
    disablePrev,
    disableNext,
    onClickPrev: handleClickPrev,
    onClickNext: handleClickNext,
  };
}
