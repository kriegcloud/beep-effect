import { extend } from "@pixi/react";
import { Text, TextStyle } from "pixi.js";

extend({ Text });

export const Label = (props: {
  text: string;
  x: number;
  y: number;
  opacity: number;
  anchor: number;
  color: string;
}) => {
  return (
    <pixiText
      text={props.text}
      x={props.x}
      y={props.y}
      anchor={props.anchor}
      alpha={props.opacity}
      style={
        new TextStyle({
          fontFamily: "Arial",
          fontSize: 12,
          fill: props.color,
          fontWeight: "400",
          align: "center",
        })
      }
    />
  );
};
