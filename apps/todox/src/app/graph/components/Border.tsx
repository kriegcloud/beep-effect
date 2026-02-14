import { extend } from "@pixi/react";
import Matter from "matter-js";
import { Graphics } from "pixi.js";
import React from "react";

import { SCALE } from "../constants";
import { useEngine } from "./World";

extend({ Graphics });

const WALL_THICKNESS = 50;

export const Border = () => {
  const engine = useEngine();

  React.useEffect(() => {
    if (!engine) return;

    const walls = [
      // top
      Matter.Bodies.rectangle(SCALE / 2, -WALL_THICKNESS / 2, SCALE, WALL_THICKNESS, { isStatic: true }),
      // bottom
      Matter.Bodies.rectangle(SCALE / 2, SCALE + WALL_THICKNESS / 2, SCALE, WALL_THICKNESS, { isStatic: true }),
      // left
      Matter.Bodies.rectangle(-WALL_THICKNESS / 2, SCALE / 2, WALL_THICKNESS, SCALE, { isStatic: true }),
      // right
      Matter.Bodies.rectangle(SCALE + WALL_THICKNESS / 2, SCALE / 2, WALL_THICKNESS, SCALE, { isStatic: true }),
    ];

    Matter.World.add(engine.world, walls);

    return () => {
      Matter.World.remove(engine.world, walls);
    };
  }, [engine]);

  const draw = React.useCallback((g: Graphics) => {
    g.clear();
    g.rect(0, 0, SCALE, SCALE);
    g.stroke({ width: 1, color: "rgba(255, 255, 255, 0.175)" });
  }, []);

  return <pixiGraphics draw={draw} />;
};
