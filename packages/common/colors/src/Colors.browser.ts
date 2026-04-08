/**
 * Browser-safe entrypoint for `@beep/colors`.
 *
 * Browser consoles do not interpret ANSI escape sequences, so this entrypoint always
 * returns plain string formatters while preserving the same API shape as the default module.
 *
 * @since 0.0.0
 * @module @beep/colors/Colors.browser
 */

import { $ColorsId } from "@beep/identity";
import * as S from "effect/Schema";
import {
  ColorsFields,
  Formatter as FormatterSchema,
  type Formatter as FormatterType,
} from "./internal/ColorsSchema.ts";

const $I = $ColorsId.create("Domain");
const identity: FormatterType = String;

/**
 * Browser-safe formatter model.
 *
 * Browser builds keep the same API shape as the Node entrypoint, but never emit ANSI
 * escape sequences and keep `createColors` bound to the browser implementation.
 *
 * @example
 * ```typescript
 * import { Colors, createColors } from "@beep/colors"
 *
 * const colors = createColors(false)
 * const rendered = colors.bold("hello")
 * console.log(rendered) // "hello"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Colors extends S.Class<Colors>($I`Colors`)(
  ColorsFields,
  $I.annote("Colors", {
    description: "The browser-safe Colors configuration object.",
  })
) {
  readonly createColors = createColors;
}

/**
 * Browser builds never emit ANSI escape sequences.
 *
 * @example
 * ```typescript
 * import { isColorSupported } from "@beep/colors"
 *
 * console.log(typeof isColorSupported) // "boolean"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const isColorSupported = false;

/**
 * Browser builds always disable ANSI escape sequences.
 *
 * @example
 * ```typescript
 * import { supportsColor } from "@beep/colors"
 *
 * console.log(supportsColor()) // false
 * ```
 *
 * @category utilities
 * @returns {boolean} - Always `false` in browser-safe builds.
 * @since 0.0.0
 */
export const supportsColor = (): boolean => false;

/**
 * Create a browser-safe formatter set that never emits ANSI escape sequences.
 *
 * The optional flag is accepted for API parity with the Node entrypoint, but ignored.
 *
 * @example
 * ```typescript
 * import { createColors } from "@beep/colors"
 *
 * const colors = createColors(true)
 * const rendered = colors.red("error")
 * console.log(rendered) // "error" (no ANSI in browser builds)
 * ```
 *
 * @category utilities
 * @param _enabled {boolean | undefined} - Ignored in browser-safe builds.
 * @returns {Colors} - A formatter set whose members coerce input with `String(...)`.
 * @since 0.0.0
 */
export const createColors = (_enabled?: boolean): Colors =>
  new Colors({
    isColorSupported: false,
    reset: identity,
    bold: identity,
    dim: identity,
    italic: identity,
    underline: identity,
    inverse: identity,
    hidden: identity,
    strikethrough: identity,
    black: identity,
    red: identity,
    green: identity,
    yellow: identity,
    blue: identity,
    magenta: identity,
    cyan: identity,
    white: identity,
    gray: identity,
    bgBlack: identity,
    bgRed: identity,
    bgGreen: identity,
    bgYellow: identity,
    bgBlue: identity,
    bgMagenta: identity,
    bgCyan: identity,
    bgWhite: identity,
    blackBright: identity,
    redBright: identity,
    greenBright: identity,
    yellowBright: identity,
    blueBright: identity,
    magentaBright: identity,
    cyanBright: identity,
    whiteBright: identity,
    bgBlackBright: identity,
    bgRedBright: identity,
    bgGreenBright: identity,
    bgYellowBright: identity,
    bgBlueBright: identity,
    bgMagentaBright: identity,
    bgCyanBright: identity,
    bgWhiteBright: identity,
  });

/**
 * Default browser-safe formatter set.
 *
 * @example
 * ```typescript
 * import colors from "@beep/colors"
 *
 * const rendered = colors.green("ok")
 * console.log(typeof rendered) // "string"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
const colors = createColors();

/**
 * Schema describing a unary formatter function.
 *
 * @example
 * ```typescript
 * import { type Formatter } from "@beep/colors"
 *
 * const fmt: Formatter = String
 * console.log(fmt(42)) // "42"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Formatter = FormatterSchema;
export default colors;
