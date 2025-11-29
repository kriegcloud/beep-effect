import type { UnsafeTypes } from "@beep/types";
import { useCallback, useLayoutEffect, useState } from "react";

interface DimensionObject {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

type UseDimensionsHook = {
  readonly dimensions: DimensionObject;
  readonly isLandscape: boolean;
  readonly node: HTMLElement;
  readonly ref: React.RefCallback<HTMLElement>;
};

function getDimensionObject(node: HTMLElement): DimensionObject {
  const rect: UnsafeTypes.UnsafeAny = node.getBoundingClientRect();

  return {
    bottom: rect.bottom,
    height: rect.height,
    left: "y" in rect ? rect.y : rect.left,
    right: rect.right,
    top: "x" in rect ? rect.x : rect.top,
    width: rect.width,
    x: "x" in rect ? rect.x : rect.left,
    y: "y" in rect ? rect.y : rect.top,
  };
}

export function useDimensions({
  enabled = true,
  liveMeasure = false,
  onResize = true,
}: {
  readonly enabled?: undefined | boolean;
  readonly liveMeasure?: undefined | boolean;
  readonly onResize?: undefined | boolean;
} = {}): UseDimensionsHook {
  const [dimensions, setDimensions] = useState<DimensionObject>({} as UnsafeTypes.UnsafeAny);
  const [node, setNode] = useState<UnsafeTypes.UnsafeAny>(null);

  const ref: React.RefCallback<HTMLElement> = useCallback((node) => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    if (!enabled) return;
    if (node) {
      const measure = () => {
        if (liveMeasure) {
          return window.requestAnimationFrame(() => {
            if (!enabled) return;

            setDimensions(getDimensionObject(node));
          });
        }
        if (!enabled) return;

        setDimensions(getDimensionObject(node));
        return;
      };
      measure();

      if (onResize) {
        window.addEventListener("resize", measure);
        // window.addEventListener('scroll', measure);

        return () => {
          window.removeEventListener("resize", measure);
          // window.removeEventListener('scroll', measure);
        };
      }
    }
    return;
  }, [enabled, liveMeasure, node, onResize]);

  return {
    dimensions,
    isLandscape: dimensions.height < dimensions.width,
    node,
    ref,
  };
}
