/**
 * Reusable schemas for decoding duration values from Effect-compatible inputs.
 *
 * @since 0.0.0
 * @module @beep/schema/Duration
 */

import { $SchemaId } from "@beep/identity";
import { Effect, Option, pipe, SchemaGetter, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as D from "effect/Duration";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("Duration");

const hasDurationObjectValue = (value: {
  readonly weeks?: number | undefined;
  readonly days?: number | undefined;
  readonly hours?: number | undefined;
  readonly minutes?: number | undefined;
  readonly seconds?: number | undefined;
  readonly milliseconds?: number | undefined;
  readonly microseconds?: number | undefined;
  readonly nanoseconds?: number | undefined;
}): boolean =>
  pipe(
    [
      value.weeks,
      value.days,
      value.hours,
      value.minutes,
      value.seconds,
      value.milliseconds,
      value.microseconds,
      value.nanoseconds,
    ],
    A.some(P.isNotUndefined)
  );

const DurationObjectHasValue = S.makeFilter(hasDurationObjectValue, {
  identifier: $I`DurationObjectHasValue`,
  title: "Duration Object Has Value",
  description: "A duration object with at least one populated unit field.",
  message: "Duration object must include at least one populated unit field.",
});

/**
 * Literal union of duration unit labels accepted by {@link DurationInput}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const DurationUnit = LiteralKit([
  "nano",
  "nanos",
  "micro",
  "micros",
  "milli",
  "millis",
  "second",
  "seconds",
  "minute",
  "minutes",
  "hour",
  "hours",
  "day",
  "days",
  "week",
  "weeks",
]).pipe(
  S.annotate(
    $I.annote("DurationUnit", {
      description: "A unit of time measurement accepted by duration input schemas.",
    })
  )
);

/**
 * Type for {@link DurationUnit}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DurationUnit = typeof DurationUnit.Type;

/**
 * Backwards-compatible alias for {@link DurationUnit}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Unit = DurationUnit;

/**
 * Structured duration input with additive unit fields.
 *
 * @since 0.0.0
 * @category Validation
 */
export class DurationObject extends S.Class<DurationObject>($I`DurationObject`)(
  {
    weeks: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    days: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    hours: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    minutes: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    seconds: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    milliseconds: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    microseconds: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
    nanoseconds: S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.optionalKey),
  },
  $I.annote("DurationObject", {
    description: "A structured duration input whose populated unit fields are added together.",
  })
) {}

const NonEmptyDurationObject = DurationObject.check(DurationObjectHasValue);

/**
 * Schema for duration inputs accepted by {@link DurationFromInput}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const DurationInput = S.Union([
  S.Duration,
  S.Int.check(S.isGreaterThanOrEqualTo(0)),
  S.BigInt.check(S.isGreaterThanOrEqualToBigInt(0n)),
  S.Tuple([S.Number.pipe(S.brand("seconds")), S.Number.pipe(S.brand("nanos"))]),
  S.TemplateLiteral([S.Number, " ", DurationUnit]),
  NonEmptyDurationObject,
]).pipe(
  S.annotate(
    $I.annote("DurationInput", {
      description:
        "Duration input accepted as an existing Duration, numeric transport, duration string, or additive object.",
    })
  )
);

/**
 * Type for {@link DurationInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DurationInput = typeof DurationInput.Type;

const invalidDurationInputIssue = (input: DurationInput) =>
  new SchemaIssue.InvalidValue(Option.some(input), {
    message: "Expected a valid duration input.",
  });

const decodeDurationInput = (input: DurationInput): Effect.Effect<D.Duration, SchemaIssue.Issue> => {
  const duration = D.fromInput(input);

  return pipe(
    duration,
    Option.match({
      onNone: () => Effect.fail(invalidDurationInputIssue(input)),
      onSome: Effect.succeed,
    })
  );
};

/**
 * One-way schema that decodes {@link DurationInput} into an Effect
 * {@link D.Duration}.
 *
 * Encoding back to the original input is intentionally forbidden because the
 * additive object form and normalized duration values are not invertible.
 *
 * @since 0.0.0
 * @category Validation
 */
export const DurationFromInput = DurationInput.pipe(
  S.decodeTo(S.Duration, {
    decode: SchemaGetter.transformOrFail(decodeDurationInput),
    encode: SchemaGetter.forbidden(
      () => "Encoding DurationFromInput results back to the original duration input is not supported"
    ),
  }),
  S.annotate(
    $I.annote("DurationFromInput", {
      description: "A one-way schema that normalizes supported duration inputs into an Effect Duration value.",
    })
  )
);

/**
 * Type for {@link DurationFromInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DurationFromInput = typeof DurationFromInput.Type;
