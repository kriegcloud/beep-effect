import { throttle } from "@beep/utils";
import { useCallback, useEffect, useState } from "react";

export function useScroll(queryClassName: string, offsetValue: number) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const handleScroll = useCallback(() => {
    const innerHeight = window.innerHeight * offsetValue;
    const scrollPosition = window.scrollY + innerHeight;
    const sections = document.querySelectorAll(`.${queryClassName}`);

    let newIndex: number | null = null;

    sections.forEach((section, index) => {
      const top = (section as HTMLDivElement).offsetTop;
      const bottom = top + section.clientHeight;

      if (scrollPosition >= top && scrollPosition < bottom) {
        newIndex = index;
      }
    });

    setActiveIndex(newIndex);
  }, [offsetValue, queryClassName]);

  const throttledHandleScroll = throttle(handleScroll, 1000);

  useEffect(() => {
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      throttledHandleScroll.cancel();
    };
  }, [throttledHandleScroll]);

  return activeIndex;
}

export function useHashScroll(offset: number) {
  const scrollToHash = useCallback(
    (hash: string) => {
      const element = document.querySelector(hash);
      if (element) {
        const top = (element as HTMLDivElement).offsetTop - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [offset]
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) scrollToHash(hash);
  }, [scrollToHash]);

  return scrollToHash;
}
