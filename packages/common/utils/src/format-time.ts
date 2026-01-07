/**
 * Temporal formatting helpers exported via the `@beep/utils` namespace, keeping
 * human-friendly date/time utilities consistent across apps.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const formatTimeRange: FooTypes.Prettify<{ start: string; end: string }> = {
 *   start: "2024-01-01",
 *   end: "2024-01-05",
 * };
 * const formatTimeRangeLabel = Utils.fDateRangeShortLabel(formatTimeRange.start, formatTimeRange.end);
 * void formatTimeRangeLabel;
 *
 * @category Documentation
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Str from "effect/String";
/**
 * Input union accepted by the date formatting helpers (DateTime, native dates,
 * ISO strings, timestamps, or nullable values for safe guards).
 *
 * @example
 * import type { DatePickerFormat } from "@beep/utils/format-time";
 *
 * const value: DatePickerFormat = new Date();
 *
 * @category Formatting
 * @since 0.1.0
 */
export type DatePickerFormat = DateTime.DateTime | Date | string | number | null | undefined;

/**
 * Commonly used format strings shared across formatting helpers.
 *
 * @example
 * import { formatPatterns } from "@beep/utils/format-time";
 *
 * formatPatterns.date; // "DD MMM YYYY"
 *
 * @category Formatting
 * @since 0.1.0
 */
export const formatPatterns = {
  dateTime: "DD MMM YYYY h:mm a", // 17 Apr 2022 12:00 am
  date: "DD MMM YYYY", // 17 Apr 2022
  time: "h:mm a", // 12:00 am
  split: {
    dateTime: "DD/MM/YYYY h:mm a", // 17/04/2022 12:00 am
    date: "DD/MM/YYYY", // 17/04/2022
  },
  paramCase: {
    dateTime: "DD-MM-YYYY h:mm a", // 17-04-2022 12:00 am
    date: "DD-MM-YYYY", // 17-04-2022
  },
};

/**
 * Helper to convert various inputs to DateTime.DateTime
 */
const toDateTime = (date: DatePickerFormat): O.Option<DateTime.DateTime> => {
  if (date === null || date === undefined) {
    return O.none();
  }
  if (DateTime.isDateTime(date)) {
    return O.some(date);
  }
  return DateTime.make(date);
};

const isValidDate = (date: DatePickerFormat): boolean => O.isSome(toDateTime(date));

/**
 * Format a DateTime using a custom format string
 * Converts dayjs-style format tokens to Intl.DateTimeFormat options
 */
const formatWithTemplate = (dt: DateTime.DateTime, template: string): string => {
  const parts = DateTime.toParts(dt);

  const replacements = [
    { token: "YYYY", value: String(parts.year) },
    { token: "MMM", value: new Date(parts.year, parts.month - 1).toLocaleString("en", { month: "short" }) },
    { token: "MM", value: F.pipe(String(parts.month), Str.padStart(2, "0")) },
    { token: "DD", value: F.pipe(String(parts.day), Str.padStart(2, "0")) },
    { token: "HH", value: F.pipe(String(parts.hours), Str.padStart(2, "0")) },
    { token: "mm", value: F.pipe(String(parts.minutes), Str.padStart(2, "0")) },
    { token: "ss", value: F.pipe(String(parts.seconds), Str.padStart(2, "0")) },
    { token: "h", value: String(parts.hours % 12 || 12) },
    { token: "a", value: parts.hours >= 12 ? "pm" : "am" },
  ] as const;

  const withPlaceholders = F.pipe(
    replacements,
    A.reduce(template, (acc, replacement, index) =>
      F.pipe(acc, Str.replace(new RegExp(replacement.token, "g"), `__FMT_${index}__`))
    )
  );

  return F.pipe(
    replacements,
    A.reduce(withPlaceholders, (acc, replacement, index) =>
      F.pipe(acc, Str.replace(new RegExp(`__FMT_${index}__`, "g"), replacement.value))
    )
  );
};

/**
 * Returns the current day formatted with the provided template (defaults to
 * start of day in ISO format).
 *
 * @example
 * import { today } from "@beep/utils/format-time";
 *
 * today("YYYY-MM-DD");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function today(template?: undefined | string): string {
  const now = DateTime.unsafeNow();
  const startOfDay = DateTime.startOf(now, "day");
  return template ? formatWithTemplate(startOfDay, template) : DateTime.formatIso(startOfDay);
}

/**
 * Formats a date/time value using the configured datetime template.
 *
 * @example
 * import { fDateTime } from "@beep/utils/format-time";
 *
 * fDateTime(new Date(), "YYYY-MM-DD HH:mm");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fDateTime(date: DatePickerFormat, template?: undefined | string): string {
  const dt = toDateTime(date);
  if (O.isNone(dt)) {
    return "Invalid date";
  }
  return template ? formatWithTemplate(dt.value, template) : formatWithTemplate(dt.value, formatPatterns.dateTime);
}

/**
 * Formats a value as a date string.
 *
 * @example
 * import { fDate } from "@beep/utils/format-time";
 *
 * fDate("2024-01-01");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fDate(date: DatePickerFormat, template?: undefined | string): string {
  const dt = toDateTime(date);
  if (O.isNone(dt)) {
    return "Invalid date";
  }
  return formatWithTemplate(dt.value, template ?? formatPatterns.date);
}

/**
 * Formats a value as a time string.
 *
 * @example
 * import { fTime } from "@beep/utils/format-time";
 *
 * fTime("2024-01-01T12:00:00Z");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fTime(date: DatePickerFormat, template?: undefined | string): string {
  const dt = toDateTime(date);
  if (O.isNone(dt)) {
    return "Invalid date";
  }
  return formatWithTemplate(dt.value, template ?? formatPatterns.time);
}

/**
 * Converts a value into a millisecond timestamp.
 *
 * @example
 * import { fTimestamp } from "@beep/utils/format-time";
 *
 * fTimestamp(new Date());
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fTimestamp(date: DatePickerFormat): number | "Invalid date" {
  const dt = toDateTime(date);
  if (O.isNone(dt)) {
    return "Invalid date";
  }
  return DateTime.toEpochMillis(dt.value);
}

/**
 * Returns a relative time string (e.g., `"5 minutes"`).
 *
 * @example
 * import { fToNow } from "@beep/utils/format-time";
 *
 * fToNow(DateTime.unsafeNow());
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fToNow(date: DatePickerFormat): string {
  const dt = toDateTime(date);
  if (O.isNone(dt)) {
    return "Invalid date";
  }

  const now = DateTime.unsafeNow();
  const distance = DateTime.distance(now, dt.value);
  const absDistance = Math.abs(distance);
  const absDuration = Duration.millis(absDistance);

  const seconds = Duration.toSeconds(absDuration);
  const minutes = Duration.toMinutes(absDuration);
  const hours = Duration.toHours(absDuration);
  const days = Duration.toDays(absDuration);

  if (seconds < 60) {
    return `${Math.floor(seconds)} second${Math.floor(seconds) !== 1 ? "s" : ""}`;
  }
  if (minutes < 60) {
    return `${Math.floor(minutes)} minute${Math.floor(minutes) !== 1 ? "s" : ""}`;
  }
  if (hours < 24) {
    return `${Math.floor(hours)} hour${Math.floor(hours) !== 1 ? "s" : ""}`;
  }
  return `${Math.floor(days)} day${Math.floor(days) !== 1 ? "s" : ""}`;
}

/**
 * Checks whether an input date falls between two other dates (inclusive).
 *
 * @example
 * import { fIsBetween } from "@beep/utils/format-time";
 *
 * fIsBetween("2024-01-02", "2024-01-01", "2024-01-03");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fIsBetween(
  inputDate: DatePickerFormat,
  startDate: DatePickerFormat,
  endDate: DatePickerFormat
): boolean {
  const input = toDateTime(inputDate);
  const start = toDateTime(startDate);
  const end = toDateTime(endDate);

  if (O.isNone(input) || O.isNone(start) || O.isNone(end)) {
    return false;
  }

  return DateTime.between(input.value, { minimum: start.value, maximum: end.value });
}

/**
 * Returns `true` when the first date is strictly after the second.
 *
 * @example
 * import { fIsAfter } from "@beep/utils/format-time";
 *
 * fIsAfter("2024-01-02", "2024-01-01");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fIsAfter(startDate: DatePickerFormat, endDate: DatePickerFormat): boolean {
  const start = toDateTime(startDate);
  const end = toDateTime(endDate);

  if (O.isNone(start) || O.isNone(end)) {
    return false;
  }

  return DateTime.greaterThan(start.value, end.value);
}

type TimeUnit = "year" | "month" | "day" | "hour" | "minute" | "second";

/**
 * Compares two dates for equality within the provided unit (defaults to year).
 *
 * @example
 * import { fIsSame } from "@beep/utils/format-time";
 *
 * fIsSame("2024-01-01", "2024-01-31", "year");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fIsSame(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
  unitToCompare?: undefined | TimeUnit
): boolean {
  const start = toDateTime(startDate);
  const end = toDateTime(endDate);

  if (O.isNone(start) || O.isNone(end)) {
    return false;
  }

  const unit = unitToCompare ?? "year";
  const startParts = DateTime.toParts(start.value);
  const endParts = DateTime.toParts(end.value);

  return F.pipe(
    Match.value(unit),
    Match.when("year", () => startParts.year === endParts.year),
    Match.when("month", () => startParts.year === endParts.year && startParts.month === endParts.month),
    Match.when(
      "day",
      () => startParts.year === endParts.year && startParts.month === endParts.month && startParts.day === endParts.day
    ),
    Match.when(
      "hour",
      () =>
        startParts.year === endParts.year &&
        startParts.month === endParts.month &&
        startParts.day === endParts.day &&
        startParts.hours === endParts.hours
    ),
    Match.when(
      "minute",
      () =>
        startParts.year === endParts.year &&
        startParts.month === endParts.month &&
        startParts.day === endParts.day &&
        startParts.hours === endParts.hours &&
        startParts.minutes === endParts.minutes
    ),
    Match.when(
      "second",
      () =>
        startParts.year === endParts.year &&
        startParts.month === endParts.month &&
        startParts.day === endParts.day &&
        startParts.hours === endParts.hours &&
        startParts.minutes === endParts.minutes &&
        startParts.seconds === endParts.seconds
    ),
    Match.exhaustive
  );
}

/**
 * Formats a date range into a short human-friendly label.
 *
 * @example
 * import { fDateRangeShortLabel } from "@beep/utils/format-time";
 *
 * fDateRangeShortLabel("2024-01-01", "2024-01-10");
 *
 * @category Formatting
 * @since 0.1.0
 */
export function fDateRangeShortLabel(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
  initial?: boolean | undefined
): string {
  if (!isValidDate(startDate) || !isValidDate(endDate) || fIsAfter(startDate, endDate)) {
    return "Invalid date";
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, "year");
  const isSameMonth = fIsSame(startDate, endDate, "month");
  const isSameDay = fIsSame(startDate, endDate, "day");

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, "DD MMM")} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, "DD")} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

/**
 * Options passed to `fAdd`/`fSub` representing a duration to add/subtract.
 *
 * @example
 * import type { DurationProps } from "@beep/utils/format-time";
 *
 * const props: DurationProps = { days: 1 };
 *
 * @category Formatting
 * @since 0.1.0
 */
export type DurationProps = {
  years?: undefined | number;
  months?: undefined | number;
  days?: undefined | number;
  hours?: undefined | number;
  minutes?: undefined | number;
  seconds?: undefined | number;
  milliseconds?: undefined | number;
};

type FAdd = (params: DurationProps) => string;

/**
 * Adds a duration relative to now and returns the formatted timestamp.
 *
 * @example
 * import { fAdd } from "@beep/utils/format-time";
 *
 * fAdd({ days: 7 });
 *
 * @category Formatting
 * @since 0.1.0
 */
export const fAdd: FAdd = ({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps) => {
  const now = DateTime.unsafeNow();
  const result = DateTime.add(now, {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    millis: milliseconds,
  });
  return DateTime.formatIso(result);
};

type FSub = (params: DurationProps) => string;

/**
 * Subtracts a duration relative to now and returns the formatted timestamp.
 *
 * @example
 * import { fSub } from "@beep/utils/format-time";
 *
 * fSub({ hours: 2 });
 *
 * @category Formatting
 * @since 0.1.0
 */
export const fSub: FSub = ({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps) => {
  const now = DateTime.unsafeNow();
  const result = DateTime.subtract(now, {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    millis: milliseconds,
  });
  return DateTime.formatIso(result);
};
