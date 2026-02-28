/**
 * Group-by clause contracts for aggregate queries.
 *
 * @since 0.0.0
 * @module @beep/ontology/groupby/GroupByClause
 */
import type { AggregatableKeys } from "../aggregate/AggregatableKeys.js";
import { TimeDurationMapping } from "../mapping/DurationMapping.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { GroupByMapper } from "./GroupByMapper.js";
/**
 * Group-by clause keyed by aggregatable properties.
 *
 * @since 0.0.0
 * @category models
 */
export type GroupByClause<Q extends ObjectOrInterfaceDefinition> = {
  [P in AggregatableKeys<Q>]?: GroupByEntry<Q, P>;
};

type BaseGroupByValue = "exact" | { $exactWithLimit: number } | ExactGroupByWithOptions;

type ExactGroupByWithOptions = {
  $exact: {
    $limit?: number;
  } & (
    | {
        $defaultValue?: undefined;
        $includeNullValue?: false;
      }
    | {
        $defaultValue: string;
        $includeNullValue?: false;
      }
    | {
        $defaultValue?: never;
        $includeNullValue: true;
      }
  );
};

/**
 * Inclusive range tuple used by `$ranges`.
 *
 * @since 0.0.0
 * @category models
 */
export type GroupByRange<T> = [T, T];

/**
 * Group-by options for string properties.
 *
 * @since 0.0.0
 * @category models
 */
export type StringGroupByValue = BaseGroupByValue;

/**
 * Group-by options for numeric-like properties.
 *
 * @since 0.0.0
 * @category models
 */
export type NumericGroupByValue = BaseGroupByValue | { $fixedWidth: number } | { $ranges: GroupByRange<number>[] };

/**
 * Group-by options for timestamp properties.
 *
 * @since 0.0.0
 * @category models
 */
export type TimestampGroupByValue =
  | BaseGroupByValue
  | { $ranges: GroupByRange<string>[] }
  | { $duration: TimestampDurationGroupBy };

/**
 * Group-by options for datetime properties.
 *
 * @since 0.0.0
 * @category models
 */
export type DateGroupByValue =
  | BaseGroupByValue
  | { $ranges: GroupByRange<string>[] }
  | { $duration: DatetimeDurationGroupBy };

/**
 * Group-by options for booleans.
 *
 * @since 0.0.0
 * @category models
 */
export type BooleanGroupByValue = BaseGroupByValue;

/**
 * Duration units accepted by timestamp duration group-by entries.
 *
 * @since 0.0.0
 * @category models
 */
export type TimestampTimeUnits = DateTimeUnits | "SECONDS" | "MINUTES" | "HOURS";

/**
 * Duration units accepted by datetime duration group-by entries.
 *
 * @since 0.0.0
 * @category models
 */
export type DateTimeUnits = "DAYS" | "WEEKS" | "MONTHS" | "YEARS" | "QUARTERS";

/**
 * Supported shorthand duration unit keywords for group-by bucketing.
 *
 * @since 0.0.0
 * @category constants
 */
export const DurationMapping: {
  quarter: "QUARTERS";
  quarters: "QUARTERS";
  sec: "SECONDS";
  seconds: "SECONDS";
  min: "MINUTES";
  minute: "MINUTES";
  minutes: "MINUTES";
  hr: "HOURS";
  hrs: "HOURS";
  hour: "HOURS";
  hours: "HOURS";
  day: "DAYS";
  days: "DAYS";
  wk: "WEEKS";
  week: "WEEKS";
  weeks: "WEEKS";
  mos: "MONTHS";
  month: "MONTHS";
  months: "MONTHS";
  yr: "YEARS";
  year: "YEARS";
  years: "YEARS";
} = {
  ...TimeDurationMapping,
  quarter: "QUARTERS",
  quarters: "QUARTERS",
} satisfies Readonly<Record<string, DateTimeUnits | TimestampTimeUnits>>;

interface TimeValueMapping {
  SECONDS: number;
  MINUTES: number;
  HOURS: number;
  DAYS: number;
  WEEKS: 1;
  MONTHS: 1;
  YEARS: 1;
  QUARTERS: 1;
}

type DurationGroupBy<A> = {
  [K in keyof typeof DurationMapping]: (typeof DurationMapping)[K] extends A
    ? [TimeValueMapping[(typeof DurationMapping)[K]], K]
    : never;
}[keyof typeof DurationMapping];

type TimestampDurationGroupBy = DurationGroupBy<TimestampTimeUnits>;
type DatetimeDurationGroupBy = DurationGroupBy<DateTimeUnits>;

type GroupByEntry<
  Q extends ObjectOrInterfaceDefinition,
  P extends AggregatableKeys<Q>,
> = CompileTimeMetadata<Q>["properties"][P]["type"] extends keyof GroupByMapper
  ? GroupByMapper[CompileTimeMetadata<Q>["properties"][P]["type"]]
  : never;

/**
 * Union of all supported group-by value contracts.
 *
 * @since 0.0.0
 * @category models
 */
export type AllGroupByValues = GroupByMapper[keyof GroupByMapper];
