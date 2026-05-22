/**
 * Namespace-first public module for reusable Glob schemas.
 *
 * @example
 * ```ts
 * import * as Glob from "@beep/schema/Glob"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownOption(Glob.Schema)
 * console.log(decode)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
/**
 * @since 0.0.0
 * @category schemas
 */
export * from "./Glob.schema.ts";
