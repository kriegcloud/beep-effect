import { useEffect } from "react";

export const useLockScroll = (lock: boolean, scrollContainerSelector: string) => {
  useEffect(() => {
    const scrollContainer = document.querySelector(scrollContainerSelector) as HTMLElement;

    if (!scrollContainer) return;
    if (lock) {
      // Calculate scrollbar width by comparing offsetWidth and clientWidth
      const scrollbarWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;

      // Add padding to prevent content shift
      scrollContainer.style.paddingRight = `${scrollbarWidth}px`;
      scrollContainer.style.overflow = "hidden";
    } else {
      scrollContainer.style.paddingRight = "0px";
      scrollContainer.style.overflow = "auto";
    }
  }, [lock, scrollContainerSelector]);
};
