"use client";

import { Input } from "@beep/todox/components/ui/input";
import { Label } from "@beep/todox/components/ui/label";
import { cn } from "@beep/todox/lib/utils";
import { calculateZoomLevel } from "@lexical/utils";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type * as React from "react";
import type { JSX } from "react";
import { useId, useMemo, useRef, useState } from "react";
import { isKeyboardInput } from "../utils/focusUtils";

let skipAddingToHistoryStack = false;

interface ColorPickerProps {
  readonly color: string;
  readonly onChange?: undefined | ((value: string, skipHistoryStack: boolean, skipRefocus: boolean) => void);
}

export function parseAllowedColor(input: string) {
  return O.isSome(Str.match(/^rgb\(\d+, \d+, \d+\)$/)(input)) ? input : "";
}

const basicColors = [
  "#d0021b",
  "#f5a623",
  "#f8e71c",
  "#8b572a",
  "#7ed321",
  "#417505",
  "#bd10e0",
  "#9013fe",
  "#4a90e2",
  "#50e3c2",
  "#b8e986",
  "#000000",
  "#4a4a4a",
  "#9b9b9b",
  "#ffffff",
];

const WIDTH = 214;
const HEIGHT = 150;

export default function ColorPicker({ color, onChange }: Readonly<ColorPickerProps>): JSX.Element {
  const [selfColor, setSelfColor] = useState(transformColor("hex", color));
  const [inputColor, setInputColor] = useState(transformColor("hex", color).hex);
  const innerDivRef = useRef(null);
  const hexId = useId();

  const saturationPosition = useMemo(
    () => ({
      x: (selfColor.hsv.s / 100) * WIDTH,
      y: ((100 - selfColor.hsv.v) / 100) * HEIGHT,
    }),
    [selfColor.hsv.s, selfColor.hsv.v]
  );

  const huePosition = useMemo(
    () => ({
      x: (selfColor.hsv.h / 360) * WIDTH,
    }),
    [selfColor.hsv]
  );

  const emitOnChange = (newColor: string, skipRefocus = false) => {
    // Check if the dropdown is actually active
    if (innerDivRef.current !== null && onChange) {
      onChange(newColor, skipAddingToHistoryStack, skipRefocus);
    }
  };

  const onSetHex = (hex: string) => {
    setInputColor(hex);
    if (O.isSome(Str.match(/^#[0-9A-Fa-f]{6}$/i)(hex))) {
      const newColor = transformColor("hex", hex);
      setSelfColor(newColor);
      emitOnChange(newColor.hex);
    }
  };

  const onMoveSaturation = ({ x, y }: Position) => {
    const newHsv = {
      ...selfColor.hsv,
      s: (x / WIDTH) * 100,
      v: 100 - (y / HEIGHT) * 100,
    };
    const newColor = transformColor("hsv", newHsv);
    setSelfColor(newColor);
    setInputColor(newColor.hex);
    emitOnChange(newColor.hex);
  };

  const onMoveHue = ({ x }: Position) => {
    const newHsv = { ...selfColor.hsv, h: (x / WIDTH) * 360 };
    const newColor = transformColor("hsv", newHsv);

    setSelfColor(newColor);
    setInputColor(newColor.hex);
    emitOnChange(newColor.hex);
  };

  const onBasicColorClick = (e: React.MouseEvent, basicColor: string) => {
    const newColor = transformColor("hex", basicColor);

    setSelfColor(newColor);
    setInputColor(newColor.hex);
    emitOnChange(newColor.hex, isKeyboardInput(e));
  };

  return (
    <div className="w-[214px]" ref={innerDivRef}>
      <div className="flex flex-row items-center mb-3 gap-3">
        <Label className="text-sm font-medium" htmlFor={hexId}>
          Hex
        </Label>
        <Input
          id={hexId}
          className="flex-1 h-8 font-mono text-sm"
          value={inputColor}
          onChange={(e) => onSetHex(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {A.map(basicColors, (basicColor) => (
          <button
            type="button"
            className={cn(
              "rounded size-5 cursor-pointer border border-border transition-shadow hover:scale-110",
              basicColor === selfColor.hex && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
            key={basicColor}
            style={{ backgroundColor: basicColor }}
            onClick={(e) => onBasicColorClick(e, basicColor)}
          />
        ))}
      </div>
      <MoveWrapper
        className="w-full relative h-[150px] select-none rounded-md"
        style={{
          backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
          backgroundImage: "linear-gradient(transparent, black), linear-gradient(to right, white, transparent)",
        }}
        onChange={onMoveSaturation}
      >
        <div
          className="absolute size-5 border-2 border-white rounded-full shadow-md box-border -translate-x-2.5 -translate-y-2.5 pointer-events-none"
          style={{
            backgroundColor: selfColor.hex,
            left: saturationPosition.x,
            top: saturationPosition.y,
          }}
        />
      </MoveWrapper>
      <MoveWrapper
        className="w-full relative mt-3 h-3 select-none rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0))",
        }}
        onChange={onMoveHue}
      >
        <div
          className="absolute size-5 border-2 border-white rounded-full shadow-md box-border -translate-x-2.5 -translate-y-1 pointer-events-none"
          style={{
            backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
            left: huePosition.x,
          }}
        />
      </MoveWrapper>
      <div className="border border-border mt-3 w-full h-6 rounded-md" style={{ backgroundColor: selfColor.hex }} />
    </div>
  );
}

export interface Position {
  readonly x: number;
  readonly y: number;
}

interface MoveWrapperProps {
  readonly className?: undefined | string;
  readonly style?: undefined | React.CSSProperties;
  readonly onChange: (position: Position) => void;
  readonly children: JSX.Element;
}

function MoveWrapper({ className, style, onChange, children }: MoveWrapperProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  const move = (e: React.MouseEvent | MouseEvent): void => {
    if (divRef.current) {
      const { current: div } = divRef;
      const { width, height, left, top } = div.getBoundingClientRect();
      const zoom = calculateZoomLevel(div);
      const x = clamp(e.clientX / zoom - left, width, 0);
      const y = clamp(e.clientY / zoom - top, height, 0);

      onChange({ x, y });
    }
  };

  const onMouseDown = (e: React.MouseEvent): void => {
    if (e.button !== 0) {
      return;
    }

    move(e);

    const onMouseMove = (_e: MouseEvent): void => {
      draggedRef.current = true;
      skipAddingToHistoryStack = true;
      move(_e);
    };

    const onMouseUp = (_e: MouseEvent): void => {
      if (draggedRef.current) {
        skipAddingToHistoryStack = false;
      }

      document.removeEventListener("mousemove", onMouseMove, false);
      document.removeEventListener("mouseup", onMouseUp, false);

      move(_e);
      draggedRef.current = false;
    };

    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mouseup", onMouseUp, false);
  };

  return (
    <div ref={divRef} className={className} style={style} onMouseDown={onMouseDown}>
      {children}
    </div>
  );
}

function clamp(value: number, max: number, min: number) {
  return value > max ? max : value < min ? min : value;
}

interface RGB {
  readonly b: number;
  readonly g: number;
  readonly r: number;
}
interface HSV {
  readonly h: number;
  readonly s: number;
  readonly v: number;
}
interface Color {
  readonly hex: string;
  readonly hsv: HSV;
  readonly rgb: RGB;
}

export function toHex(value: string): string {
  if (!Str.startsWith("#")(value)) {
    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) {
      return value; // Return original value if canvas not available
    }

    ctx.fillStyle = value;

    return ctx.fillStyle;
  }
  if (value.length === 4 || value.length === 5) {
    value = A.map(Str.split(value, ""), (v, i) => (i ? v + v : "#")).join("");

    return value;
  }
  if (value.length === 7 || value.length === 9) {
    return value;
  }

  return "#000000";
}

function hex2rgb(hex: string): RGB {
  const expanded = Str.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, "#$1$1$2$2$3$3")(hex);
  const hexPart = Str.slice(1, Str.length(expanded))(expanded);
  const matches = Str.matchAll(/.{2}/g)(hexPart);
  const rbgArr = A.map(A.fromIterable(matches), (match) => Number.parseInt(match[0], 16));

  return {
    b: rbgArr[2]!,
    g: rbgArr[1]!,
    r: rbgArr[0]!,
  };
}

function rgb2hsv({ r, g, b }: RGB): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);

  const h = d ? (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? 2 + (b - r) / d : 4 + (r - g) / d) * 60 : 0;
  const s = max ? (d / max) * 100 : 0;
  const v = max * 100;

  return { h, s, v };
}

function hsv2rgb({ h, s, v }: HSV): RGB {
  s /= 100;
  v /= 100;

  const i = ~~(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const index = i % 6;

  const r = Math.round([v, q, p, p, t, v][index]! * 255);
  const g = Math.round([t, v, v, q, p, p][index]! * 255);
  const b = Math.round([p, p, t, v, v, q][index]! * 255);

  return { b, g, r };
}

function rgb2hex({ b, g, r }: RGB): string {
  return `#${A.map([r, g, b], (x) => Str.padStart(2, "0")(x.toString(16))).join("")}`;
}

function transformColor<M extends keyof Color, C extends Color[M]>(format: M, color: C): Color {
  let hex: Color["hex"] = toHex("#121212");
  let rgb: Color["rgb"] = hex2rgb(hex);
  let hsv: Color["hsv"] = rgb2hsv(rgb);

  if (format === "hex") {
    const value = color as Color["hex"];

    hex = toHex(value);
    rgb = hex2rgb(hex);
    hsv = rgb2hsv(rgb);
  } else if (format === "rgb") {
    const value = color as Color["rgb"];

    rgb = value;
    hex = rgb2hex(rgb);
    hsv = rgb2hsv(rgb);
  } else if (format === "hsv") {
    const value = color as Color["hsv"];

    hsv = value;
    rgb = hsv2rgb(hsv);
    hex = rgb2hex(rgb);
  }

  return { hex, hsv, rgb };
}
