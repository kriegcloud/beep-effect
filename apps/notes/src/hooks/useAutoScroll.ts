import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export const useAutoScroll = (
  target: HTMLElement | null,
  {
    enabled = true,
  }: {
    enabled?: boolean;
  } = {}
) => {
  // canScrollCheck after 100ms
  const canScrollCheck = useDebounce(enabled, 100);

  // Ref for the chat box to control scroll position.
  const autoScroll = useRef(true);

  // Ref to store the last scroll top position.
  const lastScrollTop = useRef(0);

  const scrollCheck = useCallback(() => {
    if (!canScrollCheck) {
      lastScrollTop.current = 0;

      return;
    }
    if (!target) return;

    const { clientHeight, scrollHeight, scrollTop } = target;

    // If user scrolls up, turn off auto-scrolling.
    if (scrollTop < lastScrollTop.current) {
      autoScroll.current = false;
    }
    // If user scrolls down and is within 175px of the bottom, turn on auto-scrolling.
    else if (scrollTop > lastScrollTop.current && scrollTop + clientHeight >= scrollHeight - 175) {
      autoScroll.current = true;
    }

    // Update the last scroll top position.
    lastScrollTop.current = scrollTop;
  }, [canScrollCheck, target]);

  const scrollToBottom = useCallback(() => {
    // Auto-scroll if enabled and the chat box element exists.
    if (autoScroll.current && target) {
      window.requestAnimationFrame(() => {
        target?.scrollTo({
          top: target.scrollHeight,
        });
      });
    }
  }, [target]);

  useEffect(() => {
    scrollCheck();
  }, [scrollCheck]);

  // Run scrollToBottom once when the component mounts.
  useLayoutEffect(() => {
    scrollToBottom();
  });

  return { scrollCheck, scrollToBottom };
};
