/**
 * Primary Effect Duration schema for the `Duration` concept module.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";

/**
 * Schema for Effect `Duration` values.
 *
 * @example
 * ```ts
 * import * as Duration from "@beep/schema/Duration"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownOption(Duration.Schema)
 * console.log(decode)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Schema = S.Duration;

/**
 * Runtime type extracted from {@link Schema}.
 *
 * @category models
 * @since 0.0.0
 */
export type Schema = typeof Schema.Type;

/**
 * Compatibility alias for the primary Effect Duration schema.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Duration = Schema;

/**
 * Runtime type extracted from {@link Duration}.
 *
 * @category models
 * @since 0.0.0
 */
export type Duration = Schema;
