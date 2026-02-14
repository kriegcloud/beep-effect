import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import React from "react";

extend({ Graphics });

export const Line = (props: { x1: number; y1: number; x2: number; y2: number; color: string }) => {
  const draw = React.useCallback(
    (g: Graphics) => {
      g.clear();
      g.moveTo(props.x1, props.y1);
      g.lineTo(props.x2, props.y2);
      g.stroke({ width: 1, color: props.color, alpha: 1 });
    },
    [props.x1, props.y1, props.x2, props.y2, props.color]
  );

  return <pixiGraphics draw={draw} />;
};
