/**
 * Internal schemas for ANSI color formatter objects.
 *
 * @module
 * @since 0.0.0
 */

import { $ColorsId } from "@beep/identity";
import { Fn } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ColorsId.create("Domain");

/**
 * Input accepted by a color formatter.
 *
 * @example
 * ```typescript
 * import { FormatterInput } from "./ColorsSchema.ts"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(FormatterInput)
 * console.log(decode("ready"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const FormatterInput = S.Union([S.String, S.Number]).pipe(
  S.UndefinedOr,
  $I.annoteSchema("FormatterInput", {
    description: "Input accepted by a color formatter.",
  })
);

/**
 * Runtime type for {@link FormatterInput}.
 *
 * @example
 * ```typescript
 * import type { FormatterInput } from "./ColorsSchema.ts"
 *
 * const input: FormatterInput = 42
 * console.log(input)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FormatterInput = typeof FormatterInput.Type;

/**
 * Schema for a formatter that renders one value to a string.
 *
 * @example
 * ```typescript
 * import type { Formatter } from "./ColorsSchema.ts"
 *
 * const formatter: Formatter = (input) => `${input}`
 * console.log(formatter(42))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Formatter = Fn({
  input: FormatterInput,
  output: S.String,
}).pipe(
  $I.annoteSchema("Formatter", {
    description: "A unary formatter that wraps string output with ANSI escape sequences.",
  })
);

/**
 * Runtime type for {@link Formatter}.
 *
 * @example
 * ```typescript
 * import type { Formatter } from "@beep/colors/Colors"
 *
 * const formatter: Formatter = (input) => `${input}`
 * console.log(formatter("ready"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Formatter = typeof Formatter.Type;

/**
 * Schema fields used to construct a `Colors` formatter set.
 *
 * @example
 * ```typescript
 * import { ColorsFields } from "./ColorsSchema.ts"
 *
 * const hasBold = "bold" in ColorsFields
 * console.log(hasBold)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
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
