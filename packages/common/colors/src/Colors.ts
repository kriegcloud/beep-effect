/**
 * A module containing the Domain Schema's & Implementation
 * `@beep/colors` library
 *
 * @module @beep/colors/Colors
 * @since 0.0.0
 */

import { $ColorsId } from "@beep/identity";
import { Fn } from "@beep/schema";
import { identity } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $ColorsId.create("Domain");

class ProcessLike extends S.Class<ProcessLike>($I`ProcessLike`)({
  argv: S.String.pipe(S.Array, S.optionalKey),
  env: S.Record(S.String, S.UndefinedOr(S.String)).pipe(S.optionalKey),
  platform: S.optionalKey(S.String),
  stdout: S.optionalKey(
    S.Struct({
      isTTY: S.optionalKey(S.Boolean),
    })
  ),
}) {}

const FormatterInput = S.Union([S.String, S.Number]).pipe(
  S.UndefinedOr,
  $I.annoteSchema("FormatterInput", {
    description: "The input to a Colors input formatter",
  })
);

const processLike: ProcessLike = typeof process === "undefined" ? {} : process;
const argv = processLike.argv ?? [];
const env = processLike.env ?? {};

const isColorSupported =
  (!(Boolean(env.NO_COLOR) || A.contains(argv, "--no-color")) && Boolean(env.FORCE_COLOR)) ||
  processLike.platform === "win32" ||
  (Boolean(processLike.stdout?.isTTY) && env.TERM !== "dumb") ||
  Boolean(env.CI);

const replaceClose = (string: string, close: string, replace: string, index: number) => {
  let result = "";
  let cursor = 0;

  do {
    result += string.substring(cursor, index) + replace;
    cursor = index + close.length;
    index = string.indexOf(close, cursor);
  } while (index !== -1);

  return result + string.substring(cursor);
};

const strIdentity = identity(String);

type FormatterInput = typeof FormatterInput.Type;

export const Formatter = Fn({
  input: FormatterInput,
  output: S.String,
}).pipe(
  $I.annoteSchema("Formatter", {
    description: "A formatter function for Colors",
  })
);

export type Formatter = typeof Formatter.Type;

const formatter =
  (open: string, close: string, replace = open): Formatter =>
  (input) => {
    const string = String(input);
    const index = string.indexOf(close, open.length);

    return index !== -1 ? open + replaceClose(string, close, replace, index) + close : open + string + close;
  };

export class Colors extends S.Class<Colors>($I`Colors`)(
  {
    isColorSupported: S.Boolean,

    reset: Formatter,
    bold: Formatter,
    dim: Formatter,
    italic: Formatter,
    underline: Formatter,
    inverse: Formatter,
    hidden: Formatter,
    strikethrough: Formatter,

    black: Formatter,
    red: Formatter,
    green: Formatter,
    yellow: Formatter,
    blue: Formatter,
    magenta: Formatter,
    cyan: Formatter,
    white: Formatter,
    gray: Formatter,

    bgBlack: Formatter,
    bgRed: Formatter,
    bgGreen: Formatter,
    bgYellow: Formatter,
    bgBlue: Formatter,
    bgMagenta: Formatter,
    bgCyan: Formatter,
    bgWhite: Formatter,

    blackBright: Formatter,
    redBright: Formatter,
    greenBright: Formatter,
    yellowBright: Formatter,
    blueBright: Formatter,
    magentaBright: Formatter,
    cyanBright: Formatter,
    whiteBright: Formatter,

    bgBlackBright: Formatter,
    bgRedBright: Formatter,
    bgGreenBright: Formatter,
    bgYellowBright: Formatter,
    bgBlueBright: Formatter,
    bgMagentaBright: Formatter,
    bgCyanBright: Formatter,
    bgWhiteBright: Formatter,
  },
  $I.annote("Colors", {
    description: "The Colors configuration object.",
  })
) {
  readonly createColors = createColors;
}

const createColors = (enabled = isColorSupported) => {
  const f: typeof formatter = enabled ? formatter : () => strIdentity;

  return new Colors({
    isColorSupported: enabled,
    reset: f("\x1b[0m", "\x1b[0m"),
    bold: f("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m"),
    dim: f("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m"),
    italic: f("\x1b[3m", "\x1b[23m"),
    underline: f("\x1b[4m", "\x1b[24m"),
    inverse: f("\x1b[7m", "\x1b[27m"),
    hidden: f("\x1b[8m", "\x1b[28m"),
    strikethrough: f("\x1b[9m", "\x1b[29m"),

    black: f("\x1b[30m", "\x1b[39m"),
    red: f("\x1b[31m", "\x1b[39m"),
    green: f("\x1b[32m", "\x1b[39m"),
    yellow: f("\x1b[33m", "\x1b[39m"),
    blue: f("\x1b[34m", "\x1b[39m"),
    magenta: f("\x1b[35m", "\x1b[39m"),
    cyan: f("\x1b[36m", "\x1b[39m"),
    white: f("\x1b[37m", "\x1b[39m"),
    gray: f("\x1b[90m", "\x1b[39m"),

    bgBlack: f("\x1b[40m", "\x1b[49m"),
    bgRed: f("\x1b[41m", "\x1b[49m"),
    bgGreen: f("\x1b[42m", "\x1b[49m"),
    bgYellow: f("\x1b[43m", "\x1b[49m"),
    bgBlue: f("\x1b[44m", "\x1b[49m"),
    bgMagenta: f("\x1b[45m", "\x1b[49m"),
    bgCyan: f("\x1b[46m", "\x1b[49m"),
    bgWhite: f("\x1b[47m", "\x1b[49m"),

    blackBright: f("\x1b[90m", "\x1b[39m"),
    redBright: f("\x1b[91m", "\x1b[39m"),
    greenBright: f("\x1b[92m", "\x1b[39m"),
    yellowBright: f("\x1b[93m", "\x1b[39m"),
    blueBright: f("\x1b[94m", "\x1b[39m"),
    magentaBright: f("\x1b[95m", "\x1b[39m"),
    cyanBright: f("\x1b[96m", "\x1b[39m"),
    whiteBright: f("\x1b[97m", "\x1b[39m"),

    bgBlackBright: f("\x1b[100m", "\x1b[49m"),
    bgRedBright: f("\x1b[101m", "\x1b[49m"),
    bgGreenBright: f("\x1b[102m", "\x1b[49m"),
    bgYellowBright: f("\x1b[103m", "\x1b[49m"),
    bgBlueBright: f("\x1b[104m", "\x1b[49m"),
    bgMagentaBright: f("\x1b[105m", "\x1b[49m"),
    bgCyanBright: f("\x1b[106m", "\x1b[49m"),
    bgWhiteBright: f("\x1b[107m", "\x1b[49m"),
  });
};

const colors = createColors();

export default colors;
