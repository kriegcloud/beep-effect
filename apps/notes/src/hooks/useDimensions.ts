import { useCallback, useLayoutEffect, useState } from "react";

interface DimensionObject {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

type UseDimensionsHook = {
  dimensions: DimensionObject;
  isLandscape: boolean;
  node: HTMLElement;
  ref: React.RefCallback<HTMLElement>;
};

function getDimensionObject(node: HTMLElement): DimensionObject {
  const rect: any = node.getBoundingClientRect();

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
  enabled?: boolean;
  liveMeasure?: boolean;
  onResize?: boolean;
} = {}): UseDimensionsHook {
  const [dimensions, setDimensions] = useState<DimensionObject>({} as any);
  const [node, setNode] = useState<any>(null);

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
  }, [enabled, liveMeasure, node, onResize]);

  return {
    dimensions,
    isLandscape: dimensions.height < dimensions.width,
    node,
    ref,
  };
}
