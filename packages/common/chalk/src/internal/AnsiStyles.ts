import { $ChalkId } from "@beep/identity/packages";
import { flow, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { backgroundColorNameValues, foregroundColorNameValues, modifierNameValues } from "./ChalkSchema.ts";

type AnsiCodePair = readonly [open: number, close: number];
const $I = $ChalkId.create("Domain");

export type ModifierStyleName = (typeof modifierNameValues)[number];
export type ForegroundStyleName = (typeof foregroundColorNameValues)[number];
export type BackgroundStyleName = (typeof backgroundColorNameValues)[number];
export type StyleName = ModifierStyleName | ForegroundStyleName | BackgroundStyleName;

export class StylerEntry extends S.Class<StylerEntry>($I`StylerEntry`)(
  {
    open: S.String,
    close: S.String,
  },
  $I.annote("StylerEntry", {
    description: "Open and close ANSI escape sequences for a single chalk style.",
  })
) {}

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 =
  (offset = 0) =>
  (code: number): string =>
    `\u001B[${code + offset}m`;

const wrapAnsi256 =
  (offset = 0) =>
  (code: number): string =>
    `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m =
  (offset = 0) =>
  (red: number, green: number, blue: number): string =>
    `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const modifierCodes: Record<ModifierStyleName, AnsiCodePair> = {
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  overline: [53, 55],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
};

const foregroundCodes: Record<ForegroundStyleName, AnsiCodePair> = {
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],
};

const backgroundCodes: Record<BackgroundStyleName, AnsiCodePair> = {
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49],
};

const toStyleEntry = ([open, close]: AnsiCodePair): StylerEntry =>
  new StylerEntry({
    open: `\u001B[${open}m`,
    close: `\u001B[${close}m`,
  });

const modifierStyles: Record<string, StylerEntry> = pipe(
  modifierCodes,
  R.toEntries,
  A.map(([styleName, pair]) => [styleName, toStyleEntry(pair)] as const),
  R.fromEntries
);

const foregroundStyles: Record<string, StylerEntry> = pipe(
  foregroundCodes,
  R.toEntries,
  A.map(([styleName, pair]) => [styleName, toStyleEntry(pair)] as const),
  R.fromEntries
);

const backgroundStyles: Record<string, StylerEntry> = pipe(
  backgroundCodes,
  R.toEntries,
  A.map(([styleName, pair]) => [styleName, toStyleEntry(pair)] as const),
  R.fromEntries
);

export const ansiStyles = {
  modifier: modifierStyles,
  color: {
    ...foregroundStyles,
    close: "\u001B[39m",
    ansi: wrapAnsi16(),
    ansi16m: wrapAnsi16m(),
    ansi256: wrapAnsi256(),
  },
  bgColor: {
    ...backgroundStyles,
    close: "\u001B[49m",
    ansi: wrapAnsi16(ANSI_BACKGROUND_OFFSET),
    ansi16m: wrapAnsi16m(ANSI_BACKGROUND_OFFSET),
    ansi256: wrapAnsi256(ANSI_BACKGROUND_OFFSET),
  },
};

const isModifierStyleName = (styleName: StyleName): styleName is ModifierStyleName => styleName in modifierStyles;

const isForegroundStyleName = (styleName: StyleName): styleName is ForegroundStyleName => styleName in foregroundStyles;

export const getStyleEntry = (styleName: StyleName): StylerEntry =>
  Match.type<StyleName>().pipe(
    Match.when(isModifierStyleName, (value) => modifierStyles[value]),
    Match.when(isForegroundStyleName, (value) => foregroundStyles[value]),
    Match.orElse((value) => backgroundStyles[value])
  )(styleName);

const parseHexMatch = (hex: string): O.Option<string> =>
  pipe(
    /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex),
    O.fromNullishOr,
    O.map((match) => match[0])
  );

const expandShortHex = flow(Str.split(""), A.map(Str.repeat(2)), A.join(""));

const canonicalizeHex = (matched: string): string =>
  pipe(
    matched.length === 3,
    Bool.match({
      onFalse: () => matched,
      onTrue: () => expandShortHex(matched),
    })
  );

const toRgbTuple = (canonical: string): readonly [red: number, green: number, blue: number] => {
  const integer = Number.parseInt(canonical, 16);

  return [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff];
};

const renderExtendedMonochromeAnsi256 = (red: number): number =>
  pipe(
    red > 248,
    Bool.match({
      onFalse: () => Math.round(((red - 8) / 247) * 24) + 232,
      onTrue: () => 231,
    })
  );

const renderMonochromeAnsi256 = (red: number): number =>
  pipe(
    red < 8,
    Bool.match({
      onFalse: () => renderExtendedMonochromeAnsi256(red),
      onTrue: () => 16,
    })
  );

export const rgbToAnsi256 = (red: number, green: number, blue: number): number => {
  return pipe(
    red === green && green === blue,
    Bool.match({
      onFalse: () =>
        16 + 36 * Math.round((red / 255) * 5) + 6 * Math.round((green / 255) * 5) + Math.round((blue / 255) * 5),
      onTrue: () => renderMonochromeAnsi256(red),
    })
  );
};

export const hexToRgb = (hex: string): readonly [red: number, green: number, blue: number] =>
  pipe(
    parseHexMatch(hex),
    O.match({
      onNone: () => [0, 0, 0],
      onSome: flow(canonicalizeHex, toRgbTuple),
    })
  );

const renderAnsiCodeBrightness = (value: number, result: number): number =>
  pipe(
    value === 2,
    Bool.match({
      onFalse: () => result,
      onTrue: () => result + 60,
    })
  );

const ansi256ToAnsiGray = (code: number): number => {
  const gray = ((code - 232) * 10 + 8) / 255;
  const value = gray * 2;
  const result = 30 + ((Math.round(gray) << 2) | (Math.round(gray) << 1) | Math.round(gray));

  return pipe(
    value === 0,
    Bool.match({
      onFalse: () => renderAnsiCodeBrightness(value, result),
      onTrue: () => 30,
    })
  );
};

const ansi256ToAnsiColorCube = (code: number): number => {
  const relativeCode = code - 16;
  const remainder = relativeCode % 36;
  const red = Math.floor(relativeCode / 36) / 5;
  const green = Math.floor(remainder / 6) / 5;
  const blue = (remainder % 6) / 5;
  const value = Math.max(red, green, blue) * 2;
  const result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

  return pipe(
    value === 0,
    Bool.match({
      onFalse: () => renderAnsiCodeBrightness(value, result),
      onTrue: () => 30,
    })
  );
};

export const ansi256ToAnsi = (code: number): number =>
  Match.type<number>().pipe(
    Match.when(
      (value) => value < 8,
      (value) => 30 + value
    ),
    Match.when(
      (value) => value < 16,
      (value) => 90 + (value - 8)
    ),
    Match.when((value) => value >= 232, ansi256ToAnsiGray),
    Match.orElse(ansi256ToAnsiColorCube)
  )(code);

export const rgbToAnsi = (red: number, green: number, blue: number): number =>
  ansi256ToAnsi(rgbToAnsi256(red, green, blue));

export const hexToAnsi256 = (hex: string): number => rgbToAnsi256(...hexToRgb(hex));

export const hexToAnsi = (hex: string): number => ansi256ToAnsi(hexToAnsi256(hex));

const renderRgbModel = (
  level: "ansi" | "ansi256" | "ansi16m",
  type: "color" | "bgColor",
  arguments_: ReadonlyArray<number | string>
): string => {
  const [red = 0, green = 0, blue = 0] = arguments_;

  return Match.type<"ansi" | "ansi256" | "ansi16m">().pipe(
    Match.when("ansi16m", () => ansiStyles[type].ansi16m(Number(red), Number(green), Number(blue))),
    Match.when("ansi256", () => ansiStyles[type].ansi256(rgbToAnsi256(Number(red), Number(green), Number(blue)))),
    Match.orElse(() => ansiStyles[type].ansi(rgbToAnsi(Number(red), Number(green), Number(blue))))
  )(level);
};

const renderHexModel = (
  level: "ansi" | "ansi256" | "ansi16m",
  type: "color" | "bgColor",
  arguments_: ReadonlyArray<number | string>
): string => {
  const [color = ""] = arguments_;

  return getModelAnsi("rgb", level, type, ...hexToRgb(`${color}`));
};

const renderAnsi256Model = (type: "color" | "bgColor", arguments_: ReadonlyArray<number | string>): string => {
  const [index = 0] = arguments_;

  return ansiStyles[type].ansi256(Number(index));
};

export const getModelAnsi = (
  model: "rgb" | "hex" | "ansi256",
  level: "ansi" | "ansi256" | "ansi16m",
  type: "color" | "bgColor",
  ...arguments_: ReadonlyArray<number | string>
): string =>
  Match.type<"rgb" | "hex" | "ansi256">().pipe(
    Match.when("rgb", () => renderRgbModel(level, type, arguments_)),
    Match.when("hex", () => renderHexModel(level, type, arguments_)),
    Match.orElse(() => renderAnsi256Model(type, arguments_))
  )(model);
