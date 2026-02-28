/**
 * Time-series query and access helper types.
 *
 * @since 0.0.0
 * @module @beep/ontology/timeseries/timeseries
 */
import { TimeDurationMapping } from "../mapping/DurationMapping.js";

/**
 * Supported duration units for time-series relative queries.
 *
 * @since 0.0.0
 * @category models
 */
export type TimeseriesDurationUnits =
  | "YEARS"
  | "MONTHS"
  | "WEEKS"
  | "DAYS"
  | "HOURS"
  | "MINUTES"
  | "SECONDS"
  | "MILLISECONDS";

/**
 * Mapping of shorthand duration unit keys to canonical timeseries units.
 *
 * @since 0.0.0
 * @category constants
 */
export interface TimeseriesDurationMapping {
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
  readonly ms: "MILLISECONDS";
  readonly milliseconds: "MILLISECONDS";
}

/**
 * Runtime mapping for timeseries duration units.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimeseriesDurationMapping: TimeseriesDurationMapping = {
  ms: "MILLISECONDS",
  milliseconds: "MILLISECONDS",
  ...TimeDurationMapping,
};

/**
 * Time-series query selector using either relative or absolute ranges.
 *
 * @since 0.0.0
 * @category models
 */
export type TimeSeriesQuery =
  | {
      readonly $before: number;
      readonly $unit: keyof typeof TimeseriesDurationMapping;
      readonly $after?: never;
      readonly $startTime?: never;
      readonly $endTime?: never;
    }
  | {
      readonly $after: number;
      readonly $unit: keyof typeof TimeseriesDurationMapping;
      readonly $before?: never;
      readonly $startTime?: never;
      readonly $endTime?: never;
    }
  | {
      readonly $startTime: string;
      readonly $endTime?: string;
      readonly $before?: never;
      readonly $after?: never;
      readonly $unit?: never;
    }
  | {
      readonly $startTime?: string;
      readonly $endTime: string;
      readonly $before?: never;
      readonly $after?: never;
      readonly $unit?: never;
    };

/**
 * Minimal geo-point model used by geotime-series values.
 *
 * @since 0.0.0
 * @category models
 */
export interface GeoPoint {
  readonly type: "Point";
  readonly coordinates: readonly [number, number] | readonly [number, number, number];
}

/**
 * A single time-series point.
 *
 * @since 0.0.0
 * @category models
 */
export interface TimeSeriesPoint<T extends string | number | GeoPoint> {
  readonly time: string;
  readonly value: T;
}

/**
 * Accessor contract for number/string time-series properties.
 *
 * @since 0.0.0
 * @category models
 */
export interface TimeSeriesProperty<T extends number | string> {
  readonly getFirstPoint: () => Promise<TimeSeriesPoint<T>>;
  readonly getLastPoint: () => Promise<TimeSeriesPoint<T>>;
  readonly getAllPoints: (query?: TimeSeriesQuery) => Promise<Array<TimeSeriesPoint<T>>>;
  readonly asyncIterPoints: (query?: TimeSeriesQuery) => AsyncGenerator<TimeSeriesPoint<T>>;
}

/**
 * Accessor contract for geo time-series reference properties.
 *
 * @since 0.0.0
 * @category models
 */
export interface GeotimeSeriesProperty<T extends GeoPoint> {
  readonly getLatestValue: () => Promise<TimeSeriesPoint<T> | undefined>;
  readonly getAllValues: (query?: TimeSeriesQuery) => Promise<Array<TimeSeriesPoint<T>>>;
  readonly asyncIterValues: (query?: TimeSeriesQuery) => AsyncGenerator<TimeSeriesPoint<T>>;
  readonly lastFetchedValue: TimeSeriesPoint<T> | undefined;
}
