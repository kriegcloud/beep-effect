/**
 * The two time axes the model never collapses.
 *
 * - **valid time** (`TemporalExtent`): when a proposition holds in the world.
 * - **knowledge time** (`KnowledgeInterval`): when this system recorded the row
 *   and when a later row superseded it. Half-open `[recordedAt, expiredAt)`.
 *
 * Instants are whole-second ISO-8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`). One
 * fixed-width form makes string order equal time order; fractional seconds are
 * rejected because `.` sorts before `Z` and mixed precision would break that.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { thunkFalse, thunkTrue } from "@beep/utils";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("party/Time");

/**
 * ISO-8601 UTC instant, e.g. `2025-03-12T16:42:08Z`.
 *
 * @category time
 * @since 0.0.0
 */
export const UtcInstant = S.String.check(
  S.isPattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, $I.annote("UtcInstantCheck", { message: "Expected a whole-second ISO-8601 UTC instant ending in Z." }))
).pipe(S.brand("UtcInstant"), $I.annoteSchema("UtcInstant", { description: "ISO-8601 UTC instant." }));
export type UtcInstant = typeof UtcInstant.Type;

const Instant = S.TaggedStruct("Instant", { at: UtcInstant });
const Interval = S.TaggedStruct("Interval", { from: UtcInstant, to: UtcInstant }).check(
  S.makeFilter(({ from, to }) => from < to, $I.annote("IntervalOrderCheck", { message: "Expected interval start strictly before its end." }))
);
const OpenEnded = S.TaggedStruct("OpenEnded", { from: UtcInstant });
const Unknown = S.TaggedStruct("Unknown", {});

/**
 * Valid time of a proposition. `Unknown` is a real value: a source that dates
 * nothing must not be given a fabricated interval.
 *
 * @category time
 * @since 0.0.0
 */
export const TemporalExtent = S.Union([Instant, Interval, OpenEnded, Unknown]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("TemporalExtent", { description: "When a proposition holds in the modeled world." })
);
export type TemporalExtent = typeof TemporalExtent.Type;

/**
 * Knowledge interval `[recordedAt, expiredAt)`. "Latest" is computed, never stored.
 *
 * @category time
 * @since 0.0.0
 */
export const KnowledgeInterval = S.Struct({
  recordedAt: UtcInstant,
  expiredAt: S.OptionFromNullOr(UtcInstant),
}).pipe($I.annoteSchema("KnowledgeInterval", { description: "When the system held a row as current." }));
export type KnowledgeInterval = typeof KnowledgeInterval.Type;

/**
 * Does the extent hold at `at`? `Unknown` never holds: unknown validity is not
 * "always valid".
 *
 * @category time
 * @since 0.0.0
 */
export const holdsAt: {
  (at: UtcInstant): (extent: TemporalExtent) => boolean;
  (extent: TemporalExtent, at: UtcInstant): boolean;
} = dual(2, (extent: TemporalExtent, at: UtcInstant): boolean =>
  TemporalExtent.match(extent, {
    Instant: (e) => e.at === at,
    Interval: (e) => e.from <= at && at < e.to,
    OpenEnded: (e) => e.from <= at,
    Unknown: thunkFalse,
  })
);

/**
 * Was this row part of the system's knowledge at `asOf`?
 *
 * @category time
 * @since 0.0.0
 */
export const knownAt: {
  (asOf: UtcInstant): (k: KnowledgeInterval) => boolean;
  (k: KnowledgeInterval, asOf: UtcInstant): boolean;
} = dual(
  2,
  (k: KnowledgeInterval, asOf: UtcInstant): boolean =>
    k.recordedAt <= asOf && O.match(k.expiredAt, { onNone: thunkTrue, onSome: (end) => asOf < end })
);

/**
 * Do two extents overlap? Unknown overlaps nothing.
 *
 * @category time
 * @since 0.0.0
 */
export const overlaps: {
  (b: TemporalExtent): (a: TemporalExtent) => boolean;
  (a: TemporalExtent, b: TemporalExtent): boolean;
} = dual(2, (a: TemporalExtent, b: TemporalExtent): boolean => {
  const bounds = (e: TemporalExtent): O.Option<readonly [string, string]> =>
    TemporalExtent.match(e, {
      Instant: (x) => O.some([x.at, x.at + "\u0000"] as const),
      Interval: (x) => O.some([x.from, x.to] as const),
      OpenEnded: (x) => O.some([x.from, "\uffff"] as const),
      Unknown: O.none<readonly [string, string]>,
    });
  return O.match(O.all([bounds(a), bounds(b)]), {
    onNone: thunkFalse,
    onSome: ([[a0, a1], [b0, b1]]) => a0 < b1 && b0 < a1,
  });
});
