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
 * import { Duration as EffectDuration } from "effect"
 * import * as S from "effect/Schema"
 *
 * const duration = S.decodeUnknownSync(Duration.Schema)(EffectDuration.seconds(5))
 * console.log(EffectDuration.toMillis(duration))
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
 * import { Duration as EffectDuration } from "effect"
 * import { Duration } from "@beep/schema/Duration"
 * import * as S from "effect/Schema"
 *
 * const duration = S.decodeUnknownSync(Duration)(EffectDuration.millis(250))
 * console.log(EffectDuration.toMillis(duration))
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
