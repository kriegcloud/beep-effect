import { Match } from "effect";
import type { backgroundColorNameValues, foregroundColorNameValues, modifierNameValues } from "./ChalkSchema.ts";

type AnsiCodePair = readonly [open: number, close: number];

export type ModifierStyleName = (typeof modifierNameValues)[number];
export type ForegroundStyleName = (typeof foregroundColorNameValues)[number];
export type BackgroundStyleName = (typeof backgroundColorNameValues)[number];
export type StyleName = ModifierStyleName | ForegroundStyleName | BackgroundStyleName;

export type StylerEntry = {
  readonly open: string;
  readonly close: string;
};

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

const toStyleEntry = ([open, close]: AnsiCodePair): StylerEntry => ({
  open: `\u001B[${open}m`,
  close: `\u001B[${close}m`,
});

const modifierStyles: Record<string, StylerEntry> = Object.fromEntries(
  Object.entries(modifierCodes).map(([styleName, pair]) => [styleName, toStyleEntry(pair)])
);

const foregroundStyles: Record<string, StylerEntry> = Object.fromEntries(
  Object.entries(foregroundCodes).map(([styleName, pair]) => [styleName, toStyleEntry(pair)])
);

const backgroundStyles: Record<string, StylerEntry> = Object.fromEntries(
  Object.entries(backgroundCodes).map(([styleName, pair]) => [styleName, toStyleEntry(pair)])
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

export const getStyleEntry = (styleName: StyleName): StylerEntry => {
  if (styleName in modifierStyles) {
    return modifierStyles[styleName];
  }

  if (styleName in foregroundStyles) {
    return foregroundStyles[styleName];
  }

  return backgroundStyles[styleName];
};

const parseHexMatches = (hex: string): ReadonlyArray<string> => {
  const match = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex);

  return match === null ? [] : [match[0]];
};

export const rgbToAnsi256 = (red: number, green: number, blue: number): number => {
  if (red === green && green === blue) {
    if (red < 8) {
      return 16;
    }

    if (red > 248) {
      return 231;
    }

    return Math.round(((red - 8) / 247) * 24) + 232;
  }

  return 16 + 36 * Math.round((red / 255) * 5) + 6 * Math.round((green / 255) * 5) + Math.round((blue / 255) * 5);
};

export const hexToRgb = (hex: string): readonly [red: number, green: number, blue: number] => {
  const [matched] = parseHexMatches(hex);

  if (matched === undefined) {
    return [0, 0, 0];
  }

  const canonical =
    matched.length === 3
      ? matched
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : matched;
  const integer = Number.parseInt(canonical, 16);

  return [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff];
};

export const ansi256ToAnsi = (code: number): number => {
  if (code < 8) {
    return 30 + code;
  }

  if (code < 16) {
    return 90 + (code - 8);
  }

  if (code >= 232) {
    const gray = ((code - 232) * 10 + 8) / 255;
    const value = gray * 2;

    if (value === 0) {
      return 30;
    }

    const result = 30 + ((Math.round(gray) << 2) | (Math.round(gray) << 1) | Math.round(gray));

    return value === 2 ? result + 60 : result;
  }

  const relativeCode = code - 16;
  const remainder = relativeCode % 36;
  const red = Math.floor(relativeCode / 36) / 5;
  const green = Math.floor(remainder / 6) / 5;
  const blue = (remainder % 6) / 5;
  const value = Math.max(red, green, blue) * 2;

  if (value === 0) {
    return 30;
  }

  const result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

  return value === 2 ? result + 60 : result;
};

export const rgbToAnsi = (red: number, green: number, blue: number): number =>
  ansi256ToAnsi(rgbToAnsi256(red, green, blue));

export const hexToAnsi256 = (hex: string): number => rgbToAnsi256(...hexToRgb(hex));

export const hexToAnsi = (hex: string): number => ansi256ToAnsi(hexToAnsi256(hex));

export const getModelAnsi = (
  model: "rgb" | "hex" | "ansi256",
  level: "ansi" | "ansi256" | "ansi16m",
  type: "color" | "bgColor",
  ...arguments_: ReadonlyArray<number | string>
): string =>
  Match.value(model).pipe(
    Match.when("rgb", () => {
      const [red = 0, green = 0, blue = 0] = arguments_;

      return Match.value(level).pipe(
        Match.when("ansi16m", () => ansiStyles[type].ansi16m(Number(red), Number(green), Number(blue))),
        Match.when("ansi256", () => ansiStyles[type].ansi256(rgbToAnsi256(Number(red), Number(green), Number(blue)))),
        Match.orElse(() => ansiStyles[type].ansi(rgbToAnsi(Number(red), Number(green), Number(blue))))
      );
    }),
    Match.when("hex", () => {
      const [color = ""] = arguments_;

      return getModelAnsi("rgb", level, type, ...hexToRgb(String(color)));
    }),
    Match.orElse(() => {
      const [index = 0] = arguments_;
      return ansiStyles[type].ansi256(Number(index));
    })
  );
