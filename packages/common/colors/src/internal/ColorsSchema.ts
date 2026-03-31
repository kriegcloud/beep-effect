import { $ColorsId } from "@beep/identity";
import { Fn } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ColorsId.create("Domain");

export const FormatterInput = S.Union([S.String, S.Number]).pipe(
  S.UndefinedOr,
  $I.annoteSchema("FormatterInput", {
    description: "Input accepted by a color formatter.",
  })
);

export const Formatter = Fn({
  input: FormatterInput,
  output: S.String,
}).pipe(
  $I.annoteSchema("Formatter", {
    description: "A unary formatter that wraps string output with ANSI escape sequences.",
  })
);

export type Formatter = typeof Formatter.Type;

export const ColorsFields = {
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
};
