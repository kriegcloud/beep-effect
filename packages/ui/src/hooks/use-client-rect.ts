"use client";
import type { RefObject } from "react";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Custom hook to get the bounding client rect and scroll dimensions of a DOM element.
 *
 * @param {RefObject<T | null>} [inputRef] - Optional ref object to the target element.
 * @param {string} [eventType] - Optional event type to trigger updates (e.g., 'scroll', 'resize').
 * @returns {UseClientRectReturn<T>} - Object containing the bounding rect, scroll dimensions, and ref to the element.
 */

type ScrollElValue = {
  scrollWidth: number;
  scrollHeight: number;
};

type DOMRectValue = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type UseClientRectReturn<T extends HTMLElement = HTMLElement> = DOMRectValue &
  ScrollElValue & {
    elementRef: RefObject<T>;
  };

export function useClientRect<T extends HTMLElement = HTMLElement>(
  inputRef?: RefObject<T | null> | undefined,
  eventType?: string | undefined
): UseClientRectReturn<T> {
  const localRef = useRef<T>(null);
  const elementRef = (inputRef || localRef) as RefObject<T>;

  const [rect, setRect] = useState<DOMRect | undefined>(undefined);
  const [scroll, setScroll] = useState<ScrollElValue | undefined>(undefined);

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const handleBoundingClientRect = useCallback(() => {
    if (elementRef.current) {
      const clientRect = elementRef.current.getBoundingClientRect();
      setRect(clientRect);
      setScroll({
        scrollWidth: elementRef.current.scrollWidth,
        scrollHeight: elementRef.current.scrollHeight,
      });
    }
  }, [elementRef]);

  useIsomorphicLayoutEffect(() => {
    handleBoundingClientRect();
  }, [handleBoundingClientRect]);

  useEffect(() => {
    const event = eventType || "resize";

    window.addEventListener(event, handleBoundingClientRect);
    return () => {
      window.removeEventListener(event, handleBoundingClientRect);
    };
  }, [eventType, handleBoundingClientRect]);

  const memoizedRectValue = useMemo(() => rect, [rect]);
  const memoizedScrollValue = useMemo(() => scroll, [scroll]);

  return {
    elementRef,
    top: memoizedRectValue?.top ?? 0,
    right: memoizedRectValue?.right ?? 0,
    bottom: memoizedRectValue?.bottom ?? 0,
    left: memoizedRectValue?.left ?? 0,
    x: memoizedRectValue?.x ?? 0,
    y: memoizedRectValue?.y ?? 0,
    width: memoizedRectValue?.width ?? 0,
    height: memoizedRectValue?.height ?? 0,
    scrollWidth: memoizedScrollValue?.scrollWidth ?? 0,
    scrollHeight: memoizedScrollValue?.scrollHeight ?? 0,
  };
}
