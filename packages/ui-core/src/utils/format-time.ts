import type { Dayjs, OpUnitType } from "dayjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export type DatePickerFormat = Dayjs | Date | string | number | null | undefined;

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

export function today(template?: undefined | string): string {
  return dayjs(new Date()).startOf("day").format(template);
}

export function fDateTime(date: DatePickerFormat, template?: undefined | string): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}

export function fDate(date: DatePickerFormat, template?: undefined | string): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}

export function fTime(date: DatePickerFormat, template?: undefined | string): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).format(template ?? formatPatterns.time);
}

export function fTimestamp(date: DatePickerFormat): number | "Invalid date" {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).valueOf();
}

export function fToNow(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return "Invalid date";
  }

  return dayjs(date).toNow(true);
}
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
export function fIsAfter(startDate: DatePickerFormat, endDate: DatePickerFormat): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isAfter(endDate);
}

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
export type DurationProps = {
  years?: undefined | number;
  months?: undefined | number;
  days?: undefined | number;
  hours?: undefined | number;
  minutes?: undefined | number;
  seconds?: undefined | number;
  milliseconds?: undefined | number;
};

export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps) {
  const result = dayjs()
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

  return result;
}

export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps) {
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
}
