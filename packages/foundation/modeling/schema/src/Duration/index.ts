/**
 * Namespace-first public module for reusable Duration schemas.
 *
 * @example
 * ```ts
 * import * as Duration from "@beep/schema/Duration"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownEffect(Duration.FromInput)
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
export * from "./Duration.input.ts";
/**
 * @since 0.0.0
 * @category schemas
 */
export * from "./Duration.schema.ts";
/**
 * @since 0.0.0
 * @category schemas
 */
export * from "./Duration.transforms.ts";
