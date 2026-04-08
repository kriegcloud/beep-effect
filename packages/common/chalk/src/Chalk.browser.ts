/**
 * Browser-targeted Chalk entry point.
 *
 * Provides the same API surface as `@beep/chalk/Chalk` but detects color
 * support via the browser navigator instead of Node.js TTY introspection.
 * In non-browser runtimes (e.g. Node test runners) color detection returns
 * `false` and all styling becomes a no-op passthrough.
 *
 * @example
 * ```ts
 * import chalk, { Chalk, supportsColor } from "@beep/chalk/Chalk.browser"
 *
 * if (supportsColor !== false) {
 *   console.log(chalk.red.bold("Browser color!"))
 * } else {
 *   console.log(chalk.red("no ANSI in this runtime"))
 * }
 * ```
 *
 * @since 0.0.0
 * @module @beep/chalk/Chalk.browser
 */

import { makeCreateChalk } from "./internal/ChalkRuntime.ts";
import {
  BackgroundColorName as BackgroundColorNameSchema,
  backgroundColorNameValues,
  ChalkOptions as ChalkOptionsSchema,
  ColorInfo as ColorInfoSchema,
  ColorName as ColorNameSchema,
  ColorSupportLevel as ColorSupportLevelSchema,
  ColorSupport as ColorSupportSchema,
  colorNameValues,
  ForegroundColorName as ForegroundColorNameSchema,
  foregroundColorNameValues,
  ModifierName as ModifierNameSchema,
  modifierNameValues,
} from "./internal/ChalkSchema.ts";
import { detectedSupportsColorBrowser } from "./internal/SupportsColor.browser.ts";

// oxlint-disable typescript-eslint/no-unsafe-declaration-merging

const createChalk = makeCreateChalk(detectedSupportsColorBrowser.stdout);
const createChalkStderr = makeCreateChalk(detectedSupportsColorBrowser.stderr);

const makeChalkConstructor = <Instance, Base extends abstract new (options?: ChalkOptions) => Instance>(
  ConstructorBase: Base,
  create: (options?: ChalkOptions) => object
): Base =>
  new Proxy(ConstructorBase, {
    construct(_target, [options]: ReadonlyArray<ChalkOptions | undefined>) {
      return create(options);
    },
  });

/**
 * Recursive callable Chalk builder surface (browser variant).
 *
 * Identical to the Node {@link ChalkInstance} interface. In browsers that
 * support console ANSI (Chromium 93+), styles are applied; otherwise all
 * methods pass text through unchanged.
 *
 * @example
 * ```ts
 * import chalk, { type ChalkInstance } from "@beep/chalk/Chalk.browser"
 *
 * const warning: ChalkInstance = chalk.yellow.bold
 * console.log(warning("Caution!"))
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface ChalkInstance {
  ansi256(index: number): this;
  bgAnsi256(index: number): this;
  readonly bgBlack: this;
  readonly bgBlackBright: this;
  readonly bgBlue: this;
  readonly bgBlueBright: this;
  readonly bgCyan: this;
  readonly bgCyanBright: this;
  readonly bgGray: this;
  readonly bgGreen: this;
  readonly bgGreenBright: this;
  readonly bgGrey: this;
  bgHex(color: string): this;
  readonly bgMagenta: this;
  readonly bgMagentaBright: this;
  readonly bgRed: this;
  readonly bgRedBright: this;
  bgRgb(red: number, green: number, blue: number): this;
  readonly bgWhite: this;
  readonly bgWhiteBright: this;
  readonly bgYellow: this;
  readonly bgYellowBright: this;
  readonly black: this;
  readonly blackBright: this;
  readonly blue: this;
  readonly blueBright: this;
  readonly bold: this;
  readonly cyan: this;
  readonly cyanBright: this;
  readonly dim: this;
  readonly gray: this;
  readonly green: this;
  readonly greenBright: this;
  readonly grey: this;
  hex(color: string): this;
  readonly hidden: this;
  readonly inverse: this;
  readonly italic: this;
  level: typeof ColorSupportLevelSchema.Type;
  readonly magenta: this;
  readonly magentaBright: this;
  readonly overline: this;
  readonly red: this;
  readonly redBright: this;
  readonly reset: this;
  rgb(red: number, green: number, blue: number): this;
  readonly strikethrough: this;
  readonly underline: this;
  readonly visible: this;
  readonly white: this;
  readonly whiteBright: this;
  readonly yellow: this;
  readonly yellowBright: this;
  (...text: ReadonlyArray<unknown>): string;
}

/**
 * Runtime type for isolated browser Chalk instances.
 *
 * @since 0.0.0
 * @category models
 */
class ChalkValue {
  constructor(_options?: ChalkOptions) {}
}

interface ChalkValue extends ChalkInstance {}

/**
 * An isolated browser Chalk instance with its own color support level.
 *
 * @example
 * ```ts
 * import { Chalk } from "@beep/chalk/Chalk.browser"
 *
 * const c: Chalk = new Chalk({ level: 1 })
 * console.log(c.green("OK"))
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Chalk = ChalkValue;

/**
 * Constructor for creating isolated browser Chalk instances.
 *
 * Uses browser-based color detection. Pass `{ level }` to override.
 *
 * @example
 * ```ts
 * import { Chalk } from "@beep/chalk/Chalk.browser"
 *
 * const c = new Chalk({ level: 1 })
 * console.log(c.red("styled"))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Chalk = makeChalkConstructor(ChalkValue, createChalk);

/**
 * Schema for supported Chalk background color names.
 *
 * @example
 * ```ts
 * import { BackgroundColorName } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(BackgroundColorName)
 * console.log(decode("bgRed"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const BackgroundColorName = BackgroundColorNameSchema;

/**
 * A supported Chalk background color name literal.
 *
 * @since 0.0.0
 * @category models
 */
export type BackgroundColorName = typeof BackgroundColorNameSchema.Type;

/**
 * Schema for constructor options accepted by {@link Chalk}.
 *
 * @example
 * ```ts
 * import { ChalkOptions } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ChalkOptions)
 * console.log(decode({ level: 1 }))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ChalkOptions = ChalkOptionsSchema;

/**
 * Constructor options for creating an isolated browser Chalk instance.
 *
 * @since 0.0.0
 * @category models
 */
export type ChalkOptions = typeof ChalkOptionsSchema.Type;

/**
 * Schema for detected color support information.
 *
 * @example
 * ```ts
 * import { ColorInfo, supportsColor } from "@beep/chalk/Chalk.browser"
 *
 * const info: ColorInfo = supportsColor
 * if (info !== false) {
 *   console.log("Level:", info.level)
 * }
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ColorInfo = ColorInfoSchema;

/**
 * Detected color support information, or `false` when color output is disabled.
 *
 * @since 0.0.0
 * @category models
 */
export type ColorInfo = typeof ColorInfoSchema.Type;

/**
 * Schema for all supported Chalk color names (foreground and background).
 *
 * @example
 * ```ts
 * import { ColorName } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorName)
 * console.log(decode("red"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ColorName = ColorNameSchema;

/**
 * A supported Chalk color name literal (foreground or background).
 *
 * @since 0.0.0
 * @category models
 */
export type ColorName = typeof ColorNameSchema.Type;

/**
 * Schema for terminal color support metadata.
 *
 * @example
 * ```ts
 * import { ColorSupport } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorSupport)
 * console.log(decode({
 *   level: 1,
 *   hasBasic: true,
 *   has256: false,
 *   has16m: false
 * }))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ColorSupport = ColorSupportSchema;

/**
 * Detected terminal color support capabilities for an output stream.
 *
 * @since 0.0.0
 * @category models
 */
export type ColorSupport = typeof ColorSupportSchema.Type;

/**
 * Schema for Chalk color support levels.
 *
 * Accepts `0` (disabled), `1` (basic ANSI), `2` (ANSI 256), or `3` (truecolor).
 *
 * @example
 * ```ts
 * import { ColorSupportLevel } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorSupportLevel)
 * console.log(decode(1))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ColorSupportLevel = ColorSupportLevelSchema;

/**
 * A Chalk color support level: `0` | `1` | `2` | `3`.
 *
 * @since 0.0.0
 * @category models
 */
export type ColorSupportLevel = typeof ColorSupportLevelSchema.Type;

/**
 * Schema for supported Chalk foreground color names.
 *
 * @example
 * ```ts
 * import { ForegroundColorName } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ForegroundColorName)
 * console.log(decode("blue"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ForegroundColorName = ForegroundColorNameSchema;

/**
 * A supported Chalk foreground color name literal.
 *
 * @since 0.0.0
 * @category models
 */
export type ForegroundColorName = typeof ForegroundColorNameSchema.Type;

/**
 * Schema for supported Chalk text modifier names.
 *
 * @example
 * ```ts
 * import { ModifierName } from "@beep/chalk/Chalk.browser"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ModifierName)
 * console.log(decode("italic"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ModifierName = ModifierNameSchema;

/**
 * A supported Chalk text modifier name literal.
 *
 * @since 0.0.0
 * @category models
 */
export type ModifierName = typeof ModifierNameSchema.Type;

/**
 * Readonly tuple of all supported modifier name strings.
 *
 * @example
 * ```ts
 * import { modifierNames } from "@beep/chalk/Chalk.browser"
 *
 * for (const name of modifierNames) {
 *   console.log(name)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const modifierNames = modifierNameValues;

/**
 * Readonly tuple of all supported foreground color name strings.
 *
 * @example
 * ```ts
 * import { foregroundColorNames } from "@beep/chalk/Chalk.browser"
 *
 * for (const name of foregroundColorNames) {
 *   console.log(name)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const foregroundColorNames = foregroundColorNameValues;

/**
 * Readonly tuple of all supported background color name strings.
 *
 * @example
 * ```ts
 * import { backgroundColorNames } from "@beep/chalk/Chalk.browser"
 *
 * for (const name of backgroundColorNames) {
 *   console.log(name)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const backgroundColorNames = backgroundColorNameValues;

/**
 * Readonly tuple of all supported color name strings (foreground and background).
 *
 * @example
 * ```ts
 * import { colorNames } from "@beep/chalk/Chalk.browser"
 *
 * for (const name of colorNames) {
 *   console.log(name)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const colorNames = colorNameValues;

/**
 * Alias for {@link modifierNames} preserved for Chalk API compatibility.
 *
 * @since 0.0.0
 * @category utilities
 */
export const modifiers = modifierNames;

/**
 * Alias for {@link foregroundColorNames} preserved for Chalk API compatibility.
 *
 * @since 0.0.0
 * @category utilities
 */
export const foregroundColors = foregroundColorNames;

/**
 * Alias for {@link backgroundColorNames} preserved for Chalk API compatibility.
 *
 * @since 0.0.0
 * @category utilities
 */
export const backgroundColors = backgroundColorNames;

/**
 * Alias for {@link colorNames} preserved for Chalk API compatibility.
 *
 * @since 0.0.0
 * @category utilities
 */
export const colors = colorNames;

/**
 * Color support detected for stdout in the current browser runtime.
 *
 * Returns `false` in non-browser environments (Node.js, Deno, etc.).
 *
 * @example
 * ```ts
 * import { supportsColor } from "@beep/chalk/Chalk.browser"
 *
 * if (supportsColor !== false) {
 *   console.log("Browser color level:", supportsColor.level)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const supportsColor = detectedSupportsColorBrowser.stdout;

/**
 * Color support detected for stderr in the current browser runtime.
 *
 * Returns `false` in non-browser environments.
 *
 * @example
 * ```ts
 * import { supportsColorStderr } from "@beep/chalk/Chalk.browser"
 *
 * if (supportsColorStderr !== false) {
 *   console.log("Stderr color level:", supportsColorStderr.level)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const supportsColorStderr = detectedSupportsColorBrowser.stderr;

/**
 * @since 0.0.0
 * @category models
 */
class ChalkStderrValue {
  constructor(_options?: ChalkOptions) {}
}

interface ChalkStderrValue extends ChalkInstance {}

const ChalkStderr = makeChalkConstructor(ChalkStderrValue, createChalkStderr);

/**
 * Shared browser Chalk instance configured from stderr color support detection.
 *
 * @example
 * ```ts
 * import { chalkStderr } from "@beep/chalk/Chalk.browser"
 *
 * console.error(chalkStderr.red("browser stderr error"))
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const chalkStderr: ChalkInstance = new ChalkStderr();

/**
 * Shared browser Chalk instance configured from stdout color support detection.
 *
 * In Chromium 93+ browsers, ANSI styles are applied. In all other environments
 * the text passes through unstyled.
 *
 * @example
 * ```ts
 * import chalk from "@beep/chalk/Chalk.browser"
 *
 * console.log(chalk.green("styled in Chromium"))
 * console.log(chalk.red.bold("also styled"))
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
const chalk: ChalkInstance = new Chalk();

export default chalk;
