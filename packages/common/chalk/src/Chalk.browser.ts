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
 * 
 * } else {
 * 
 * }
 * ```
 *
 * @since 0.0.0
 * @module
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
import { detectedSupportsColorBrowser } from "./internal/SupportsColor.browser.ts";

// oxlint-disable typescript-eslint/no-unsafe-declaration-merging

const createChalk = makeCreateChalk(detectedSupportsColorBrowser.stdout);
const createChalkStderr = makeCreateChalk(detectedSupportsColorBrowser.stderr);

export interface ChalkInstance extends ChalkInstanceSurface {
  (...text: ReadonlyArray<unknown>): string;
}

class ChalkValue {
  constructor(_options?: ChalkConstructorOptions) {}
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
  constructor(_options?: ChalkConstructorOptions) {}
}

interface ChalkStderrValue extends ChalkInstance {}

const ChalkStderr = makeChalkConstructor(ChalkStderrValue, createChalkStderr);

export const chalkStderr: ChalkInstance = new ChalkStderr();

const chalk: ChalkInstance = new Chalk();

export default chalk;
