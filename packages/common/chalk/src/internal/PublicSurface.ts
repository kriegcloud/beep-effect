/**
 * Public-facing Chalk constructor and instance surface contracts.
 *
 * @module
 * @since 0.0.0
 */

import { dual } from "effect/Function";
import type { ColorSupportLevel } from "./ChalkSchema.ts";

/**
 * Method and property surface shared by Chalk instances.
 *
 * @example
 * ```ts
 * import type { ChalkInstanceSurface } from "@beep/chalk/Chalk"
 *
 * const render = (chalk: ChalkInstanceSurface) => chalk.red.bold("error")
 * void render
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export declare abstract class ChalkInstanceSurface {
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
  level: ColorSupportLevel;
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
}

/**
 * Options accepted by Chalk constructors.
 *
 * @example
 * ```ts
 * import type { ChalkConstructorOptions } from "@beep/chalk/Chalk"
 *
 * const options: ChalkConstructorOptions = { level: 3 }
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ChalkConstructorOptions = Readonly<{
  readonly level?: ColorSupportLevel | number | undefined;
}>;

/**
 * Base constructor shape wrapped by the Chalk constructor proxy.
 *
 * @example
 * ```ts
 * import type { ChalkConstructorBase } from "@beep/chalk/Chalk"
 *
 * const Base: ChalkConstructorBase = class {}
 * void Base
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ChalkConstructorBase = new (options?: ChalkConstructorOptions) => object;

/**
 * Function that creates a Chalk instance from constructor options.
 *
 * @example
 * ```ts
 * import type { ChalkCreator } from "@beep/chalk/Chalk"
 *
 * const create: ChalkCreator = () => ({})
 * void create
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ChalkCreator = (options?: ChalkConstructorOptions) => object;

/**
 * Wrap a constructor base so `new` delegates to a Chalk creator.
 *
 * @example
 * ```ts
 * import { makeChalkConstructor } from "@beep/chalk/Chalk"
 *
 * const Base = class {}
 * const Chalk = makeChalkConstructor(Base, () => ({}))
 * console.log(new Chalk())
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeChalkConstructor: {
  <Base extends ChalkConstructorBase>(ConstructorBase: Base, create: ChalkCreator): Base;
  (create: ChalkCreator): <Base extends ChalkConstructorBase>(ConstructorBase: Base) => Base;
} = dual(
  2,
  <Base extends ChalkConstructorBase>(ConstructorBase: Base, create: ChalkCreator): Base =>
    new Proxy(ConstructorBase, {
      construct(_target, [options]: ReadonlyArray<ChalkConstructorOptions | undefined>) {
        return create(options);
      },
    })
);
