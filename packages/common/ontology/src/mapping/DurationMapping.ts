/**
 * Duration mapping helpers for relative time queries.
 *
 * @since 0.0.0
 * @module @beep/ontology/mapping/DurationMapping
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $OntologyId.create("mapping/DurationMapping");
/**
 * Canonical duration units used by ontology relative-time query arguments.
 *
 * @since 0.0.0
 * @category models
 */
export const TimeDurationUnit = LiteralKit([
  "YEARS",
  "MONTHS",
  "WEEKS",
  "DAYS",
  "HOURS",
  "MINUTES",
  "SECONDS",
]).annotate(
  $I.annote("TimeDurationUnit", {
    description: "Canonical duration units used by ontology relative-time query arguments.",
  })
);

/**
 * Runtime type of canonical duration units. {@link TimeDurationUnit}
 * @since 0.0.0
 * @category types
 */
export type TimeDurationUnit = typeof TimeDurationUnit.Type;

/**
 * Mapping of shorthand query duration unit keys to canonical duration units.
 *
 * @since 0.0.0
 * @category constants
 */
export interface TimeDurationMapping {
  readonly sec: "SECONDS";
  readonly seconds: "SECONDS";
  readonly min: "MINUTES";
  readonly minute: "MINUTES";
  readonly minutes: "MINUTES";
  readonly hr: "HOURS";
  readonly hrs: "HOURS";
  readonly hour: "HOURS";
  readonly hours: "HOURS";
  readonly day: "DAYS";
  readonly days: "DAYS";
  readonly wk: "WEEKS";
  readonly week: "WEEKS";
  readonly weeks: "WEEKS";
  readonly mos: "MONTHS";
  readonly month: "MONTHS";
  readonly months: "MONTHS";
  readonly yr: "YEARS";
  readonly year: "YEARS";
  readonly years: "YEARS";
}

/**
 * Runtime mapping from shorthand duration keys to canonical duration units.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimeDurationMapping: TimeDurationMapping = {
  sec: "SECONDS",
  seconds: "SECONDS",
  min: "MINUTES",
  minute: "MINUTES",
  minutes: "MINUTES",
  hr: "HOURS",
  hrs: "HOURS",
  hour: "HOURS",
  hours: "HOURS",
  day: "DAYS",
  days: "DAYS",
  wk: "WEEKS",
  week: "WEEKS",
  weeks: "WEEKS",
  mos: "MONTHS",
  month: "MONTHS",
  months: "MONTHS",
  yr: "YEARS",
  year: "YEARS",
  years: "YEARS",
};
