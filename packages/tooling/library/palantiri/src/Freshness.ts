/**
 * Parcel freshness: `Fresh` when every source reading is within the parcel's
 * bound, otherwise `Unknown` with the reason.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $PalantiriId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $PalantiriId.create("Freshness");

/**
 * Why a parcel's freshness is unknown.
 *
 * **Details**
 *
 * `stale`: the oldest reading is older than the bound. `unreachable`: the
 * source failed or returned nothing usable. `attribution-incomplete`: an
 * expected emitter is silent. `no-source`: the parcel has no source yet.
 *
 * **Example** (Narrow a reason)
 *
 * ```ts
 * import { UnknownReason } from "@beep/palantiri/Freshness"
 *
 * console.log(UnknownReason.is.stale("stale")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const UnknownReason = LiteralKit(["stale", "unreachable", "attribution-incomplete", "no-source"]).pipe(
  $I.annoteSchema("UnknownReason", { description: "Why a parcel's freshness is unknown." })
);

/**
 * Runtime type for {@link UnknownReason}.
 *
 * @category models
 * @since 0.0.0
 */
export type UnknownReason = typeof UnknownReason.Type;

/**
 * Freshness of a parcel, checked when it is read.
 *
 * **Details**
 *
 * `Fresh.asOf` is the oldest source reading. `Unknown.asOf` is that reading
 * when one exists; `detail` is a short, non-identifying explanation.
 *
 * **Example** (Match a freshness)
 *
 * ```ts
 * import { Freshness } from "@beep/palantiri/Freshness"
 * import * as O from "effect/Option"
 *
 * const unknown = Freshness.cases.Unknown.make({ reason: "unreachable", asOf: O.none(), detail: O.some("offline") })
 * console.log(Freshness.match(unknown, { Fresh: () => "fresh", Unknown: (value) => value.reason })) // "unreachable"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Freshness = S.TaggedUnion({
  Fresh: { asOf: S.DateTimeUtcFromString },
  Unknown: {
    reason: UnknownReason,
    asOf: S.OptionFromOptionalKey(S.DateTimeUtcFromString),
    detail: S.OptionFromOptionalKey(S.String),
  },
}).pipe($I.annoteSchema("Freshness", { description: "Whether a parcel's source readings are within its bound." }));

/**
 * Runtime type for {@link Freshness}.
 *
 * @category models
 * @since 0.0.0
 */
export type Freshness = typeof Freshness.Type;

/**
 * Check readings against a freshness bound.
 *
 * **Details**
 *
 * No readings is `Unknown{no-source}`. Otherwise the oldest reading decides:
 * within `bound` of `now` is `Fresh`, older is `Unknown{stale}`. A reading
 * from the future counts as fresh.
 *
 * **Example** (A reading older than the bound is stale)
 *
 * ```ts
 * import { checkFreshness } from "@beep/palantiri/Freshness"
 * import * as DateTime from "effect/DateTime"
 * import * as Duration from "effect/Duration"
 *
 * const now = DateTime.makeUnsafe("2026-10-14T12:00:00Z")
 * const old = DateTime.makeUnsafe("2026-10-14T11:50:00Z")
 * console.log(checkFreshness(now, Duration.minutes(5), [old])._tag) // "Unknown"
 * console.log(checkFreshness(now, Duration.minutes(15), [old])._tag) // "Fresh"
 * ```
 *
 * @param now - The read time.
 * @param bound - The longest a reading may age and still count as fresh.
 * @param asOfs - When each source reading was taken.
 * @returns The parcel's freshness.
 * @category utilities
 * @since 0.0.0
 */
export const checkFreshness: {
  (bound: Duration.Duration, asOfs: ReadonlyArray<DateTime.Utc>): (now: DateTime.Utc) => Freshness;
  (now: DateTime.Utc, bound: Duration.Duration, asOfs: ReadonlyArray<DateTime.Utc>): Freshness;
} = dual(
  3,
  (now: DateTime.Utc, bound: Duration.Duration, asOfs: ReadonlyArray<DateTime.Utc>): Freshness =>
    A.match(asOfs, {
      onEmpty: () =>
        Freshness.cases.Unknown.make({
          reason: UnknownReason.Enum["no-source"],
          asOf: O.none(),
          detail: O.some("no source reported a reading"),
        }),
      onNonEmpty: (readings) => {
        const oldest = A.min(readings, DateTime.Order);
        return Duration.isGreaterThan(DateTime.distance(oldest, now), bound)
          ? Freshness.cases.Unknown.make({ reason: UnknownReason.Enum.stale, asOf: O.some(oldest), detail: O.none() })
          : Freshness.cases.Fresh.make({ asOf: oldest });
      },
    })
);
