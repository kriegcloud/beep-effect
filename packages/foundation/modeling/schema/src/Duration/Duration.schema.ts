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
 * @example
 * ```ts
 * import type { Schema as DurationValue } from "@beep/schema/Duration"
 * import { Duration } from "effect"
 *
 * const duration = Duration.seconds(5) satisfies DurationValue
 * console.log(duration)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Schema = typeof Schema.Type;

/**
 * Compatibility alias for the primary Effect Duration schema.
 *
 * @example
 * ```ts
 * import { Duration } from "@beep/schema/Duration"
 *
 * console.log(Duration.ast._tag)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Duration = Schema;

/**
 * Runtime type extracted from {@link Duration}.
 *
 * @example
 * ```ts
 * import type { Duration as DurationValue } from "@beep/schema/Duration"
 * import { Duration } from "effect"
 *
 * const duration = Duration.millis(250) satisfies DurationValue
 * console.log(duration)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Duration = Schema;
