import { extend, useTick } from "@pixi/react";
import type { Body } from "matter-js";
import Matter from "matter-js";
import { Graphics } from "pixi.js";
import React from "react";

import type { NodeType } from "../logic/createNodes";
import { useEngine } from "./World";

extend({ Graphics });

interface NodeProps {
  x: number;
  y: number;
  radius: number;
  id: string;
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
}

export const Node = (props: NodeProps) => {
  const engine = useEngine();
  const body = React.useRef<Body | null>(null);
  const lastPosition = React.useRef({ x: props.x, y: props.y });
  const graphicsRef = React.useRef<Graphics | null>(null);

  useTick(() => {
    const b = body.current;
    const g = graphicsRef.current;
    if (!b || !g) return;

    // Redraw circle at current physics position
    g.clear();
    g.circle(b.position.x, b.position.y, props.radius - 8);
    g.fill("#a39af7");

    // Sync position to React state when moved
    if (
      Math.abs(lastPosition.current.x - b.position.x) > 0.1 ||
      Math.abs(lastPosition.current.y - b.position.y) > 0.1
    ) {
      lastPosition.current = { x: b.position.x, y: b.position.y };
      props.setNodes((prev: NodeType[]) => {
        return prev.map((node) => {
          if (node.key === props.id) {
            return {
              ...node,
              position: {
                x: b.position.x,
                y: b.position.y,
              },
            };
          }
          return node;
        });
      });
    }
  });

  React.useEffect(() => {
    if (!engine) return;

    body.current = Matter.Bodies.circle(...[props.x, props.y, props.radius], {
      friction: 1,
      density: 0.1,
      restitution: 0,
      frictionAir: 0.09,
      frictionStatic: 1,
    });

    Matter.World.add(engine.world, body.current);

    return () => {
      if (body.current) {
        Matter.World.remove(engine.world, body.current);
      }
    };
  }, []);

  // Initial draw (required prop); useTick handles per-frame updates
  const draw = React.useCallback(
    (g: Graphics) => {
      graphicsRef.current = g;
      g.circle(props.x, props.y, props.radius - 8);
      g.fill("#a39af7");
    },
    [props.x, props.y, props.radius]
  );

  return <pixiGraphics draw={draw} eventMode="static" cursor="pointer" />;
};
