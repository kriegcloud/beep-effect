/**
 * Chalk-compatible terminal string styling with schema-backed public models.
 *
 * Provides a chainable builder API for applying ANSI colors, background colors,
 * and text modifiers to terminal output. All color and modifier names are
 * validated by Effect Schemas, and isolated instances can be created with
 * explicit color support levels.
 *
 * @example
 * ```ts
 * import chalk, { Chalk, chalkStderr } from "@beep/chalk"
 *
 * // Default shared instance (stdout)
 * console.log(chalk.red.bold("Error!"))
 *
 * // Isolated instance with explicit color level
 * const c = new Chalk({ level: 3 })
 * console.log(c.hex("#FF8800").underline("Warning"))
 *
 * // stderr instance
 * console.log(chalkStderr.yellow("stderr warning"))
 * ```
 *
 * @since 0.0.0
 * @module @beep/chalk/Chalk
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
import {
  type ChalkConstructorOptions,
  type ChalkInstanceSurface,
  makeChalkConstructor,
} from "./internal/PublicSurface.ts";
import { detectedSupportsColor } from "./internal/SupportsColor.ts";

// oxlint-disable typescript-eslint/no-unsafe-declaration-merging

const createChalk = makeCreateChalk(detectedSupportsColor.stdout);
const createChalkStderr = makeCreateChalk(detectedSupportsColor.stderr);

/**
 * Recursive callable Chalk builder surface.
 *
 * A `ChalkInstance` is both a callable function and a chainable style builder.
 * Accessing style properties (e.g. `.red`, `.bold`) returns a new builder with
 * the style stacked, and calling it as a function applies all stacked styles to
 * the given text.
 *
 * @example
 * ```ts
 * import chalk, { type ChalkInstance } from "@beep/chalk"
 *
 * // Chain styles, then call to apply
 * const warning: ChalkInstance = chalk.yellow.bold
 * console.log(warning("Caution!"))
 *
 * // Inline chaining
 * console.log(chalk.red.bgWhite.underline("Error"))
 *
 * // Hex, RGB, and ANSI256
 * console.log(chalk.hex("#FF8800")("orange text"))
 * console.log(chalk.rgb(255, 136, 0)("orange text"))
 * console.log(chalk.ansi256(208)("orange text"))
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface ChalkInstance extends ChalkInstanceSurface {}

/**
 * Runtime type for isolated Chalk instances created by {@link Chalk}.
 *
 * @since 0.0.0
 * @category models
 */
class ChalkValue {
  constructor(_options?: ChalkConstructorOptions) {}
}

interface ChalkValue extends ChalkInstanceSurface {}

/**
 * An isolated Chalk instance with its own color support level.
 *
 * Construct via `new Chalk()` or `new Chalk({ level })` to get an instance
 * whose `level` is independent from the shared default.
 *
 * @example
 * ```ts
 * import { Chalk } from "@beep/chalk"
 *
 * const c: Chalk = new Chalk({ level: 3 })
 * console.log(c.green.bold("Success"))
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Chalk = ChalkValue;

/**
 * Constructor for creating isolated Chalk instances.
 *
 * Each instance maintains its own `level` so color output can be controlled
 * independently of the shared default. Pass `{ level: 0 }` to disable colors,
 * or `{ level: 3 }` for full truecolor support.
 *
 * @example
 * ```ts
 * import { Chalk } from "@beep/chalk"
 *
 * // Truecolor instance
 * const truecolor = new Chalk({ level: 3 })
 * console.log(truecolor.hex("#FF0000")("red text"))
 *
 * // Disabled instance (no ANSI output)
 * const plain = new Chalk({ level: 0 })
 * console.log(plain.red("no color")) // "no color"
 *
 * // Default detection
 * console.log(new Chalk().level)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Chalk = makeChalkConstructor(ChalkValue, createChalk);

/**
 * Schema for supported Chalk background color names.
 *
 * A `LiteralKit` schema accepting values like `"bgRed"`, `"bgBlue"`,
 * `"bgGreenBright"`, etc.
 *
 * @example
 * ```ts
 * import { BackgroundColorName } from "@beep/chalk"
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
 * @example
 * ```ts
 * import type { BackgroundColorName } from "@beep/chalk"
 *
 * const bg: BackgroundColorName = "bgRed"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type BackgroundColorName = typeof BackgroundColorNameSchema.Type;

/**
 * Schema for constructor options accepted by {@link Chalk}.
 *
 * Contains an optional `level` field that sets the color support level
 * (`0` through `3`).
 *
 * @example
 * ```ts
 * import { ChalkOptions } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ChalkOptions)
 * console.log(decode({ level: 2 }))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ChalkOptions = ChalkOptionsSchema;

/**
 * Constructor options for creating an isolated Chalk instance.
 *
 * @example
 * ```ts
 * import type { ChalkOptions } from "@beep/chalk"
 *
 * const opts: ChalkOptions = { level: 3 }
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ChalkOptions = typeof ChalkOptionsSchema.Type;

/**
 * Schema for detected color support information.
 *
 * Decodes to either a {@link ColorSupport} object when color output is
 * available, or `false` when it is disabled.
 *
 * @example
 * ```ts
 * import { ColorInfo, supportsColor } from "@beep/chalk"
 *
 * const info: ColorInfo = supportsColor
 * if (info !== false) {
 *   console.log("Level:", info.level)
 *   console.log("Truecolor:", info.has16m)
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
 * @example
 * ```ts
 * import type { ColorInfo } from "@beep/chalk"
 *
 * const info: ColorInfo = false
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ColorInfo = typeof ColorInfoSchema.Type;

/**
 * Schema for all supported Chalk color names (foreground and background).
 *
 * Union of {@link ForegroundColorName} and {@link BackgroundColorName} values.
 *
 * @example
 * ```ts
 * import { ColorName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorName)
 * console.log(decode("red"))
 * console.log(decode("bgBlue"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ColorName = ColorNameSchema;

/**
 * A supported Chalk color name literal (foreground or background).
 *
 * @example
 * ```ts
 * import type { ColorName } from "@beep/chalk"
 *
 * const name: ColorName = "red"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ColorName = typeof ColorNameSchema.Type;

/**
 * Schema for terminal color support metadata.
 *
 * Describes the detected capabilities of an output stream: whether it supports
 * basic ANSI, 256-color, and truecolor (16 million) modes.
 *
 * @example
 * ```ts
 * import { ColorSupport } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorSupport)
 * console.log(decode({
 *   level: 3,
 *   hasBasic: true,
 *   has256: true,
 *   has16m: true
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
 * @example
 * ```ts
 * import type { ColorSupport } from "@beep/chalk"
 *
 * const support: ColorSupport = { level: 3, hasBasic: true, has256: true, has16m: true }
 * ```
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
 * import { ColorSupportLevel } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorSupportLevel)
 * console.log(decode(3))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ColorSupportLevel = ColorSupportLevelSchema;

/**
 * A Chalk color support level: `0` | `1` | `2` | `3`.
 *
 * @example
 * ```ts
 * import type { ColorSupportLevel } from "@beep/chalk"
 *
 * const level: ColorSupportLevel = 3
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ColorSupportLevel = typeof ColorSupportLevelSchema.Type;

/**
 * Schema for supported Chalk foreground color names.
 *
 * A `LiteralKit` schema accepting values like `"red"`, `"blue"`,
 * `"greenBright"`, etc.
 *
 * @example
 * ```ts
 * import { ForegroundColorName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ForegroundColorName)
 * console.log(decode("cyanBright"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ForegroundColorName = ForegroundColorNameSchema;

/**
 * A supported Chalk foreground color name literal.
 *
 * @example
 * ```ts
 * import type { ForegroundColorName } from "@beep/chalk"
 *
 * const fg: ForegroundColorName = "cyanBright"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ForegroundColorName = typeof ForegroundColorNameSchema.Type;

/**
 * Schema for supported Chalk text modifier names.
 *
 * A `LiteralKit` schema accepting values like `"bold"`, `"italic"`,
 * `"underline"`, `"strikethrough"`, etc.
 *
 * @example
 * ```ts
 * import { ModifierName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ModifierName)
 * console.log(decode("bold"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ModifierName = ModifierNameSchema;

/**
 * A supported Chalk text modifier name literal.
 *
 * @example
 * ```ts
 * import type { ModifierName } from "@beep/chalk"
 *
 * const mod: ModifierName = "bold"
 * ```
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
 * import { modifierNames } from "@beep/chalk"
 *
 * for (const name of modifierNames) {
 *   console.log(name) // "reset" | "bold" | "dim" | ...
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
 * import { foregroundColorNames } from "@beep/chalk"
 *
 * for (const name of foregroundColorNames) {
 *   console.log(name) // "black" | "red" | "green" | ...
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
 * import { backgroundColorNames } from "@beep/chalk"
 *
 * for (const name of backgroundColorNames) {
 *   console.log(name) // "bgBlack" | "bgRed" | "bgGreen" | ...
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
 * import { colorNames } from "@beep/chalk"
 *
 * for (const name of colorNames) {
 *   console.log(name) // "black" | "red" | ... | "bgBlack" | "bgRed" | ...
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
 * @example
 * ```ts
 * import { modifiers } from "@beep/chalk"
 *
 * console.log(modifiers) // same as modifierNames
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const modifiers = modifierNames;

/**
 * Alias for {@link foregroundColorNames} preserved for Chalk API compatibility.
 *
 * @example
 * ```ts
 * import { foregroundColors } from "@beep/chalk"
 *
 * console.log(foregroundColors) // same as foregroundColorNames
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const foregroundColors = foregroundColorNames;

/**
 * Alias for {@link backgroundColorNames} preserved for Chalk API compatibility.
 *
 * @example
 * ```ts
 * import { backgroundColors } from "@beep/chalk"
 *
 * console.log(backgroundColors) // same as backgroundColorNames
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const backgroundColors = backgroundColorNames;

/**
 * Alias for {@link colorNames} preserved for Chalk API compatibility.
 *
 * @example
 * ```ts
 * import { colors } from "@beep/chalk"
 *
 * console.log(colors) // same as colorNames
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const colors = colorNames;

/**
 * Color support detected for stdout in the current Node.js runtime.
 *
 * Returns a {@link ColorSupport} object when the terminal supports color, or
 * `false` when color output is not available.
 *
 * @example
 * ```ts
 * import { supportsColor } from "@beep/chalk"
 *
 * if (supportsColor !== false) {
 *   console.log("Color level:", supportsColor.level)
 *   console.log("Truecolor:", supportsColor.has16m)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const supportsColor = detectedSupportsColor.stdout;

/**
 * Color support detected for stderr in the current Node.js runtime.
 *
 * Returns a {@link ColorSupport} object when the terminal supports color on
 * stderr, or `false` when color output is not available.
 *
 * @example
 * ```ts
 * import { supportsColorStderr } from "@beep/chalk"
 *
 * if (supportsColorStderr !== false) {
 *   console.log("Stderr color level:", supportsColorStderr.level)
 * }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const supportsColorStderr = detectedSupportsColor.stderr;

class ChalkStderrValue {
  constructor(_options?: ChalkConstructorOptions) {}
}

interface ChalkStderrValue extends ChalkInstanceSurface {}

const ChalkStderr = makeChalkConstructor(ChalkStderrValue, createChalkStderr);

/**
 * Shared Chalk instance configured from stderr color support detection.
 *
 * Use this when writing styled output to `process.stderr`.
 *
 * @example
 * ```ts
 * import { chalkStderr } from "@beep/chalk"
 *
 * process.stderr.write(chalkStderr.red.bold("Error!") + "\n")
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const chalkStderr: ChalkInstance = new ChalkStderr();

/**
 * Shared Chalk instance configured from stdout color support detection.
 *
 * This is the default export and the primary entry point for styling terminal
 * strings. Style methods can be chained and the result called as a function.
 *
 * @example
 * ```ts
 * import chalk from "@beep/chalk"
 *
 * // Simple styling
 * console.log(chalk.green("Success"))
 *
 * // Chained styles
 * console.log(chalk.red.bgWhite.bold("Alert"))
 *
 * // Nested styles via template interpolation
 * console.log(chalk.red(`Error: ${chalk.bold.underline("file not found")}`))
 *
 * // Hex and RGB colors (requires level >= 2 or 3)
 * console.log(chalk.hex("#FF8800")("orange"))
 * console.log(chalk.rgb(255, 136, 0)("also orange"))
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
const chalk: ChalkInstance = new Chalk();

export default chalk;
