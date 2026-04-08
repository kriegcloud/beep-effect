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
 * console.log(S.decodeUnknownSync(ColorSupportLevel)(2))
 * ```
 *
 * @since 0.0.0
 * @module @beep/chalk
 */
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./Chalk.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export { default } from "./Chalk.ts";
