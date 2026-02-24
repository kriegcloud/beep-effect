"use client";
import type { Dispatch, SetStateAction } from "react";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Custom hook to manage the visibility of a "Back to Top" button based on scroll position.
 *
 * @param {string | number} defaultValue - The scroll progress percentage (e.g., '90%') or distance in pixels (e.g., 80) at which the button becomes visible.
 * - If `defaultValue` is a percentage string (e.g., '90%'), the button becomes visible when the scroll distance is that percentage from the top.
 * - If `defaultValue` is a number (e.g., 80), the button becomes visible when the scroll distance is that many pixels from the bottom.
 * @param {boolean} [isDebounce=false] - Whether to debounce the scroll handler to improve performance.
 *
 * @returns {UseBackToTopReturn} - An object containing:
 * - `isVisible`: A boolean indicating whether the "Back to Top" button should be visible.
 * - `onBackToTop`: A function to scroll the window back to the top smoothly.
 * - `setIsVisible`: A function to manually set the visibility of the "Back to Top" button.
 *
 * @example
 * const { isVisible, onBackToTop } = useBackToTop('90%');
 * const { isVisible, onBackToTop } = useBackToTop(80);
 *
 * return (
 *   <button onClick={onBackToTop} style={{ display: isVisible ? 'block' : 'none' }}>
 *     Back to Top
 *   </button>
 * );
 */

export type UseBackToTopReturn = {
  readonly isVisible: boolean;
  readonly onBackToTop: () => void;
  readonly setIsVisible: Dispatch<SetStateAction<boolean>>;
};

export function useBackToTop(defaultValue: string | number, isDebounce?: boolean | undefined): UseBackToTopReturn {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const parseValue = parseValueInput(defaultValue);

  const handleScroll = useCallback(() => {
    const windowInnerHeight = window.innerHeight;
    const windowScrollY = Math.round(window.scrollY);
    const documentOffsetHeight = document.body.offsetHeight;

    const scrollProgress = Math.round((windowScrollY / (documentOffsetHeight - windowInnerHeight)) * 100);

    if (parseValue.type === "percentage") {
      setIsVisible(scrollProgress >= parseValue.value);
    } else {
      const distanceValue = documentOffsetHeight - windowInnerHeight - windowScrollY;

      setIsVisible(parseValue.value >= distanceValue);
    }
  }, [parseValue.type, parseValue.value]);

  // Debounce the scroll handler to improve performance
  const debouncedHandleScroll = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };
  }, [handleScroll]);

  useEffect(() => {
    const scrollHandler = isDebounce ? debouncedHandleScroll : handleScroll;

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [debouncedHandleScroll, handleScroll, isDebounce]);

  const onBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    isVisible,
    onBackToTop,
    setIsVisible,
  };
}

/**
 * Parses the input value to determine if it is a percentage or a number.
 *
 * @param {string | number} inputValue - The input value to parse.
 * @returns {{ value: number; type: string }} - An object containing the parsed value and its type ('percentage' or 'number').
 * @throws {Error} - Throws an error if the input value is an invalid percentage string.
 */

function parseValueInput(inputValue: string | number): {
  value: number;
  type: string;
} {
  let value: number;
  let type: string;

  if (typeof inputValue === "string") {
    if (inputValue.endsWith("%")) {
      value = Number(inputValue.slice(0, -1));
      if (Number.isNaN(value)) {
        throw new Error("Invalid percentage value");
      }
      type = "percentage";
    } else {
      throw new Error("String input must end with %");
    }
  } else {
    value = inputValue;
    type = "number";
  }

  return { value, type };
}
