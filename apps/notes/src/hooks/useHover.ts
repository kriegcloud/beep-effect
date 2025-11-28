import useEventListener from "@beep/notes/hooks/useEventListener";
import { useEffect, useRef, useState } from "react";

export interface UseHoverOptions {
  /** The delay value for a certain operation. */
  delay?: number;

  /** A boolean value that determines whether the hook is enabled. */
  enabled?: boolean;

  /** The delay duration in milliseconds for a specific action. */
  inDelay?: number;

  /**
   * The `outDelay` variable determines the delay, in milliseconds, for some
   * event or action to occur.
   */
  outDelay?: number;
}

/** Represents a hook that tracks the hover state of a specified element. */
export const useHover = <T extends HTMLElement = any>({
  delay = 0,
  enabled = true,
  inDelay = delay,
  outDelay = delay,
}: UseHoverOptions = {}) => {
  const [isHovered, setIsHovered] = useState(false);

  const elementRef = useRef<T | null>(null);
  const inTimerRef = useRef<number | null>(null);
  const outTimerRef = useRef<number | null>(null);

  const startTimer = (timer: React.MutableRefObject<number | null>, callback: () => void, delay: number) => {
    if (!timer.current) {
      timer.current = window.setTimeout(callback, delay);
    }
  };

  const clearTimer = (timer: React.MutableRefObject<number | null>) => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onMouseEnter = () => {
    clearTimer(outTimerRef);
    startTimer(inTimerRef, () => setIsHovered(true), inDelay);
  };

  // More reliable than onMouseLeave
  useEventListener("mousemove", () => {
    if (!elementRef.current) return;
    if (!elementRef.current?.matches?.(":hover")) {
      clearTimer(inTimerRef);

      if (isHovered) {
        startTimer(outTimerRef, () => setIsHovered(false), outDelay);
      }
    }
  });

  useEffect(() => {
    const onMouseExit = () => {
      clearTimer(inTimerRef);
      clearTimer(outTimerRef);
      setIsHovered(false);
    };

    document.documentElement.addEventListener("mouseleave", onMouseExit);

    elementRef.current?.addEventListener("blur-sm", onMouseExit, true);

    return () => {
      document.documentElement.removeEventListener("mouseleave", onMouseExit);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      elementRef.current?.removeEventListener("blur-sm", onMouseExit, true);
    };
  }, []);

  return [
    isHovered && enabled,
    {
      ref: elementRef,
      setIsHovered,
      onMouseEnter,
    },
  ] as const;
};

// export const useWindowHover = ({
//   enabled = true,
// }: UseHoverOptions = {}) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const inTimerRef = useRef<null | number>(null);
//   const outTimerRef = useRef<null | number>(null);
//
//   const startTimer = (
//     timer: React.MutableRefObject<null | number>,
//     callback: () => void,
//     delay: number
//   ) => {
//     if (!timer.current) {
//       timer.current = window.setTimeout(callback, delay);
//     }
//   };
//
//   const clearTimer = (timer: React.MutableRefObject<null | number>) => {
//     if (timer.current) {
//       window.clearTimeout(timer.current);
//       timer.current = null;
//     }
//   };
//
//   // Replacing onMouseEnter with mousemove for the entire document
//   useEventListener('mousemove', () => {
//     clearTimer(outTimerRef);
//     startTimer(inTimerRef, () => setIsHovered(true), inDelay);
//   }, document.documentElement);
//
//   useEffect(() => {
//     const onMouseExit = () => {
//       clearTimer(inTimerRef);
//       startTimer(outTimerRef, () => setIsHovered(false), outDelay);
//     };
//
//     document.documentElement.addEventListener('mouseleave', onMouseExit);
//
//     return () => {
//       document.documentElement.removeEventListener('mouseleave', onMouseExit);
//     };
//   }, [outDelay]);
//
//   return [isHovered && enabled, setIsHovered] as const;
// };
