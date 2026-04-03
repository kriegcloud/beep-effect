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

class ChalkValue {
  constructor(_options?: ChalkOptions) {}
}

interface ChalkValue extends ChalkInstance {}

export type Chalk = ChalkValue;

export const Chalk = makeChalkConstructor(ChalkValue, createChalk);

export const BackgroundColorName = BackgroundColorNameSchema;
export type BackgroundColorName = typeof BackgroundColorNameSchema.Type;

export const ChalkOptions = ChalkOptionsSchema;
export type ChalkOptions = typeof ChalkOptionsSchema.Type;

export const ColorInfo = ColorInfoSchema;
export type ColorInfo = typeof ColorInfoSchema.Type;

export const ColorName = ColorNameSchema;
export type ColorName = typeof ColorNameSchema.Type;

export const ColorSupport = ColorSupportSchema;
export type ColorSupport = typeof ColorSupportSchema.Type;

export const ColorSupportLevel = ColorSupportLevelSchema;
export type ColorSupportLevel = typeof ColorSupportLevelSchema.Type;

export const ForegroundColorName = ForegroundColorNameSchema;
export type ForegroundColorName = typeof ForegroundColorNameSchema.Type;

export const ModifierName = ModifierNameSchema;
export type ModifierName = typeof ModifierNameSchema.Type;

export const modifierNames = modifierNameValues;
export const foregroundColorNames = foregroundColorNameValues;
export const backgroundColorNames = backgroundColorNameValues;
export const colorNames = colorNameValues;
export const modifiers = modifierNames;
export const foregroundColors = foregroundColorNames;
export const backgroundColors = backgroundColorNames;
export const colors = colorNames;
export const supportsColor = detectedSupportsColorBrowser.stdout;
export const supportsColorStderr = detectedSupportsColorBrowser.stderr;
class ChalkStderrValue {
  constructor(_options?: ChalkOptions) {}
}

interface ChalkStderrValue extends ChalkInstance {}

const ChalkStderr = makeChalkConstructor(ChalkStderrValue, createChalkStderr);

export const chalkStderr: ChalkInstance = new ChalkStderr();

const chalk: ChalkInstance = new Chalk();

export default chalk;
