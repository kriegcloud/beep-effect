/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { useCallback, useEffect, useState } from "react";

export type ScrollDirection = "DOWN" | "LEFT" | "RIGHT" | "UP" | null;

export function getScrollTop(target?: HTMLElement) {
  if (target) return target.scrollTop;

  return window.scrollY || window.pageYOffset || document.body.scrollTop || document.documentElement?.scrollTop || 0;
}

export function getScrollLeft(target?: HTMLElement) {
  if (target) return target.scrollLeft;

  return window.scrollX || window.pageXOffset || document.body.scrollLeft || document.documentElement?.scrollLeft || 0;
}

export function isBrowser() {
  return typeof window === "object";
}

export function addScrollListener(listener: ListenerFn, target: Document | HTMLElement = document) {
  return target.addEventListener("wheel", listener);
}

export function removeScrollListener(listener: ListenerFn, target: Document | HTMLElement = document) {
  return target.removeEventListener("wheel", listener);
}

export interface ScrollDirectionHookResult {
  isScrolling: boolean;
  isScrollingDown: boolean;
  isScrollingLeft: boolean;
  isScrollingRight: boolean;
  isScrollingUp: boolean;
  isScrollingX: boolean;
  isScrollingY: boolean;
  scrollDirection: ScrollDirection;
  scrollTargetRef: (node: HTMLElement) => void;
}

type ListenerFn = () => any;

export function useScrollDirection({
  target,
  threshold = 100,
}: {
  target: HTMLElement | null;
  threshold?: number;
}): ScrollDirectionHookResult {
  const [targetFromApi, setTargetFromApi] = useState<HTMLElement | undefined>();
  const [targetFromProps, setTargetFromProps] = useState<HTMLElement | undefined>();
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const targetToUse = targetFromProps || targetFromApi;

  const isScrolling = scrollDirection !== null;
  const isScrollingX = scrollDirection === "LEFT" || scrollDirection === "RIGHT";
  const isScrollingY = scrollDirection === "UP" || scrollDirection === "DOWN";
  const isScrollingUp = scrollDirection === "UP";
  const isScrollingDown = scrollDirection === "DOWN";
  const isScrollingLeft = scrollDirection === "LEFT";
  const isScrollingRight = scrollDirection === "RIGHT";

  const scrollTargetRef = useCallback((node: HTMLElement) => {
    setTargetFromApi(node);
  }, []);

  useEffect(() => {
    if (!target) return;

    setTargetFromProps(target);
  }, [target]);

  useEffect(() => {
    if (isBrowser()) {
      let scrollTimeout: number;
      let lastScrollTop = getScrollTop(targetToUse);
      let lastScrollLeft = getScrollLeft(targetToUse);

      const handleScroll = () => {
        // Reset scroll direction when scrolling stops
        window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
          setScrollDirection(null);
        }, 66);

        // Set vertical direction while scrolling
        const scrollTop = getScrollTop(targetToUse);

        if (Math.abs(scrollTop - lastScrollTop) > threshold) {
          // Check if the scroll distance is greater than the threshold
          if (scrollTop > lastScrollTop) {
            setScrollDirection("DOWN");
          } else if (scrollTop < lastScrollTop) {
            setScrollDirection("UP");
          }
        }

        lastScrollTop = scrollTop;

        // Set horizontal scroll direction
        const scrollLeft = getScrollLeft(targetToUse);

        if (Math.abs(scrollLeft - lastScrollLeft) > threshold) {
          // Check if the scroll distance is greater than the threshold
          if (scrollLeft > lastScrollLeft) {
            setScrollDirection("RIGHT");
          } else if (scrollLeft < lastScrollLeft) {
            setScrollDirection("LEFT");
          }
        }

        lastScrollLeft = scrollLeft;
      };

      addScrollListener(handleScroll, targetToUse);

      return () => removeScrollListener(handleScroll, targetToUse);
    }
  }, [targetToUse, threshold]);

  return {
    isScrolling,
    isScrollingDown,
    isScrollingLeft,
    isScrollingRight,
    isScrollingUp,
    isScrollingX,
    isScrollingY,
    scrollDirection,
    scrollTargetRef,
  };
}
