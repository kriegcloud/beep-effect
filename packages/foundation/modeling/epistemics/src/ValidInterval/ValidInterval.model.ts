/**
 * Half-open valid-time interval `[validFrom, validTo)`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $EpistemicsId.create("ValidInterval/ValidInterval.model");

/**
 * Field set of {@link ValidInterval}, for entities that store the interval as
 * flat columns.
 *
 * **Details**
 *
 * Both bounds encode as epoch milliseconds. The open upper bound is
 * `Option.none`, encoded as `null`; there is no sentinel date. Spread or pipe
 * the fields into an entity to keep its encoded columns flat.
 *
 * **Example** (Compose valid-time fields into a struct)
 *
 * ```ts
 * import { ValidIntervalFields } from "@beep/epistemics/ValidInterval"
 * import * as S from "effect/Schema"
 *
 * const Row = S.Struct({ ...ValidIntervalFields, name: S.String })
 * const row = S.decodeUnknownSync(Row)({ name: "fact", validFrom: 1_000, validTo: null })
 * console.log(row.name)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ValidIntervalFields = {
  validFrom: S.DateTimeUtcFromMillis.annotateKey({
    description: "Inclusive valid-time lower bound: when the fact started being true.",
  }),
  validTo: S.DateTimeUtcFromMillis.pipe(S.OptionFromNullOr).annotateKey({
    description: "Exclusive valid-time upper bound; absent while the fact is still held true.",
  }),
};

/**
 * Half-open valid-time interval `[validFrom, validTo)`: when a fact holds in
 * the world, independent of when it was recorded.
 *
 * **Example** (Decode an open valid-time interval)
 *
 * ```ts
 * import { ValidInterval } from "@beep/epistemics/ValidInterval"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 *
 * const interval = S.decodeUnknownSync(ValidInterval)({ validFrom: 1_000, validTo: null })
 * console.log(O.isNone(interval.validTo)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ValidInterval = S.Struct(ValidIntervalFields).pipe(
  $I.annoteSchema("ValidInterval", {
    description: "Half-open valid-time interval [validFrom, validTo) with an optional open upper bound.",
  })
);

/**
 * Runtime type for {@link ValidInterval}.
 *
 * **Example** (Type a valid-time interval)
 *
 * ```ts
 * import type { ValidInterval } from "@beep/epistemics/ValidInterval"
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 *
 * const interval: ValidInterval = {
 *   validFrom: DateTime.makeUnsafe(1_000),
 *   validTo: O.none()
 * }
 * console.log(interval.validFrom)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ValidInterval = typeof ValidInterval.Type;
