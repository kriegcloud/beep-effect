"use client";

import type { MotionValue } from "framer-motion";
import { useScroll } from "framer-motion";
import { useMemo, useRef } from "react";

export type UseScrollProgressReturn = {
  readonly scrollXProgress: MotionValue<number>;
  readonly scrollYProgress: MotionValue<number>;
  readonly elementRef: React.RefObject<HTMLDivElement | null>;
};

export type UseScrollProgress = "document" | "container";

export function useScrollProgress(target: UseScrollProgress = "document"): UseScrollProgressReturn {
  const elementRef = useRef<HTMLDivElement>(null);

  const options = { container: elementRef };

  const { scrollYProgress, scrollXProgress } = useScroll(target === "container" ? options : undefined);

  return useMemo(
    () => ({ elementRef, scrollXProgress, scrollYProgress }),
    [elementRef, scrollXProgress, scrollYProgress]
  );
}
