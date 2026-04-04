/**
 * Chalk-compatible terminal string styling with schema-backed public models.
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
import { detectedSupportsColor } from "./internal/SupportsColor.ts";

// oxlint-disable typescript-eslint/no-unsafe-declaration-merging

const createChalk = makeCreateChalk(detectedSupportsColor.stdout);
const createChalkStderr = makeCreateChalk(detectedSupportsColor.stderr);

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
 * Recursive callable Chalk builder surface.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * Runtime type for isolated Chalk instances created by {@link Chalk}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class ChalkValue {
  constructor(_options?: ChalkOptions) {}
}

interface ChalkValue extends ChalkInstance {}

/**
 * Runtime type for isolated Chalk instances created by {@link Chalk}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Chalk = ChalkValue;

/**
 * Constructor for creating isolated Chalk instances.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const Chalk = makeChalkConstructor(ChalkValue, createChalk);

/**
 * Schema describing supported Chalk background color names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BackgroundColorName = BackgroundColorNameSchema;

/**
 * Runtime type for {@link BackgroundColorName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BackgroundColorName = typeof BackgroundColorNameSchema.Type;

/**
 * Schema describing constructor options for isolated Chalk instances.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ChalkOptions = ChalkOptionsSchema;

/**
 * Runtime type for {@link ChalkOptions}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ChalkOptions = typeof ChalkOptionsSchema.Type;

/**
 * Schema describing exported Chalk color support metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ColorInfo = ColorInfoSchema;

/**
 * Runtime type for {@link ColorInfo}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorInfo = typeof ColorInfoSchema.Type;

/**
 * Schema describing supported Chalk color names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ColorName = ColorNameSchema;

/**
 * Runtime type for {@link ColorName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorName = typeof ColorNameSchema.Type;

/**
 * Schema describing supported Chalk stream color capabilities.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ColorSupport = ColorSupportSchema;

/**
 * Runtime type for {@link ColorSupport}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorSupport = typeof ColorSupportSchema.Type;

/**
 * Schema describing supported Chalk color support levels.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ColorSupportLevel = ColorSupportLevelSchema;

/**
 * Runtime type for {@link ColorSupportLevel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorSupportLevel = typeof ColorSupportLevelSchema.Type;

/**
 * Schema describing supported Chalk foreground color names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ForegroundColorName = ForegroundColorNameSchema;

/**
 * Runtime type for {@link ForegroundColorName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ForegroundColorName = typeof ForegroundColorNameSchema.Type;

/**
 * Schema describing supported Chalk modifier names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ModifierName = ModifierNameSchema;

/**
 * Runtime type for {@link ModifierName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ModifierName = typeof ModifierNameSchema.Type;

/**
 * Basic modifier names exposed for compatibility with Chalk.
 *
 * @since 0.0.0
 * @category Utility
 */
export const modifierNames = modifierNameValues;

/**
 * Basic foreground color names exposed for compatibility with Chalk.
 *
 * @since 0.0.0
 * @category Utility
 */
export const foregroundColorNames = foregroundColorNameValues;

/**
 * Basic background color names exposed for compatibility with Chalk.
 *
 * @since 0.0.0
 * @category Utility
 */
export const backgroundColorNames = backgroundColorNameValues;

/**
 * Combined foreground and background color names exposed for compatibility with Chalk.
 *
 * @since 0.0.0
 * @category Utility
 */
export const colorNames = colorNameValues;

/**
 * Alias for {@link modifierNames} preserved for Chalk compatibility.
 *
 * @since 0.0.0
 * @category Utility
 */
export const modifiers = modifierNames;

/**
 * Alias for {@link foregroundColorNames} preserved for Chalk compatibility.
 *
 * @since 0.0.0
 * @category Utility
 */
export const foregroundColors = foregroundColorNames;

/**
 * Alias for {@link backgroundColorNames} preserved for Chalk compatibility.
 *
 * @since 0.0.0
 * @category Utility
 */
export const backgroundColors = backgroundColorNames;

/**
 * Alias for {@link colorNames} preserved for Chalk compatibility.
 *
 * @since 0.0.0
 * @category Utility
 */
export const colors = colorNames;

/**
 * Color support detected for stdout in the current runtime.
 *
 * @since 0.0.0
 * @category Utility
 */
export const supportsColor = detectedSupportsColor.stdout;

/**
 * Color support detected for stderr in the current runtime.
 *
 * @since 0.0.0
 * @category Utility
 */
export const supportsColorStderr = detectedSupportsColor.stderr;

class ChalkStderrValue {
  constructor(_options?: ChalkOptions) {}
}

interface ChalkStderrValue extends ChalkInstance {}

const ChalkStderr = makeChalkConstructor(ChalkStderrValue, createChalkStderr);

/**
 * Shared Chalk instance configured from stderr support detection.
 *
 * @since 0.0.0
 * @category Utility
 */
export const chalkStderr: ChalkInstance = new ChalkStderr();

/**
 * Shared Chalk instance configured from stdout support detection.
 *
 * @since 0.0.0
 * @category Utility
 */
const chalk: ChalkInstance = new Chalk();

export default chalk;
