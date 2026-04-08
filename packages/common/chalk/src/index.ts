/**
 * Public entrypoint for `@beep/chalk`.
 *
 * Re-exports all symbols from {@link module:@beep/chalk/Chalk} including the
 * default shared `chalk` instance, the `Chalk` constructor, schema-backed
 * color models, and compatibility arrays.
 *
 * @example
 * ```ts
 * import chalk, { Chalk, ColorSupportLevel } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * // Shared instance
 * console.log(chalk.red.bold("Error"))
 *
 * // Isolated instance
 * const c = new Chalk({ level: 3 })
 * console.log(c.hex("#FF8800")("orange"))
 *
 * // Schema decode
 * const level = S.decodeUnknownSync(ColorSupportLevel)(2)
 * ```
 *
 * @since 0.0.0
 * @module @beep/chalk
 */
export * from "./Chalk.ts";
export { default } from "./Chalk.ts";
