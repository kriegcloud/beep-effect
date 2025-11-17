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
 * @category Documentation/Modules
 * @since 0.1.0
 */
import type { Dayjs, OpUnitType } from "dayjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * Input union accepted by the date formatting helpers (`dayjs`, native dates,
 * ISO strings, timestamps, or nullable values for safe guards).
 *
 * @example
 * import type { DatePickerFormat } from "@beep/utils/format-time";
 *
 * const value: DatePickerFormat = new Date();
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export type DatePickerFormat = Dayjs | Date | string | number | null | undefined;

/**
 * Commonly used Day.js format strings shared across formatting helpers.
 *
 * @example
 * import { formatPatterns } from "@beep/utils/format-time";
 *
 * formatPatterns.date; // "DD MMM YYYY"
 *
 * @category Formatting/Temporal
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

const isValidDate = (date: DatePickerFormat) => date !== null && date !== undefined && dayjs(date).isValid();
/**
 * Returns the current day formatted with the provided template (defaults to
 * start of day in ISO format).
 *
 * @example
 * import { today } from "@beep/utils/format-time";
 *
 * today("YYYY-MM-DD");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function today(template?: undefined | string): string {
  return dayjs(new Date(Date.now())).startOf("day").format(template);
}

/**
 * Formats a date/time value using the configured datetime template.
 *
 * @example
 * import { fDateTime } from "@beep/utils/format-time";
 *
 * fDateTime(new Date(), "YYYY-MM-DD HH:mm");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fDateTime(date: DatePickerFormat, template?: undefined | string): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}

/**
 * Formats a value as a date string.
 *
 * @example
 * import { fDate } from "@beep/utils/format-time";
 *
 * fDate("2024-01-01");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fDate(date: DatePickerFormat, template?: undefined | string): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}

/**
 * Formats a value as a time string.
 *
 * @example
 * import { fTime } from "@beep/utils/format-time";
 *
 * fTime("2024-01-01T12:00:00Z");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fTime(date: DatePickerFormat, template?: undefined | string): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).format(template ?? formatPatterns.time);
}

/**
 * Converts a value into a millisecond timestamp.
 *
 * @example
 * import { fTimestamp } from "@beep/utils/format-time";
 *
 * fTimestamp(new Date());
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fTimestamp(date: DatePickerFormat): number | "Invalid date" {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).valueOf();
}

/**
 * Returns a relative time string (e.g., `"5 minutes"`).
 *
 * @example
 * import { fToNow } from "@beep/utils/format-time";
 * import dayjs from "dayjs";
 *
 * fToNow(dayjs().subtract(1, "hour"));
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fToNow(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).toNow(true);
}
/**
 * Checks whether an input date falls between two other dates (inclusive).
 *
 * @example
 * import { fIsBetween } from "@beep/utils/format-time";
 *
 * fIsBetween("2024-01-02", "2024-01-01", "2024-01-03");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fIsBetween(
  inputDate: DatePickerFormat,
  startDate: DatePickerFormat,
  endDate: DatePickerFormat
): boolean {
  if (!isValidDate(inputDate) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (
    formattedInputDate === "Invalid date" ||
    formattedStartDate === "Invalid date" ||
    formattedEndDate === "Invalid date"
  ) {
    return false;
  }

  return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
}
/**
 * Returns `true` when the first date is strictly after the second.
 *
 * @example
 * import { fIsAfter } from "@beep/utils/format-time";
 *
 * fIsAfter("2024-01-02", "2024-01-01");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fIsAfter(startDate: DatePickerFormat, endDate: DatePickerFormat): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isAfter(endDate);
}

/**
 * Compares two dates for equality within the provided unit (defaults to year).
 *
 * @example
 * import { fIsSame } from "@beep/utils/format-time";
 *
 * fIsSame("2024-01-01", "2024-01-31", "year");
 *
 * @category Formatting/Temporal
 * @since 0.1.0
 */
export function fIsSame(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
  unitToCompare?: undefined | OpUnitType
): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isSame(endDate, unitToCompare ?? "year");
}
/**
 * Formats a date range into a short human-friendly label.
 *
 * @example
 * import { fDateRangeShortLabel } from "@beep/utils/format-time";
 *
 * fDateRangeShortLabel("2024-01-01", "2024-01-10");
 *
 * @category Formatting/Temporal
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
 * Options passed to `fAdd`/`fSub` representing a duration to add/subtract via
 * Day.js.
 *
 * @example
 * import type { DurationProps } from "@beep/utils/format-time";
 *
 * const props: DurationProps = { days: 1 };
 *
 * @category Formatting/Temporal
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
 * @category Formatting/Temporal
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
  return dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();
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
 * @category Formatting/Temporal
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
  return dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();
};
