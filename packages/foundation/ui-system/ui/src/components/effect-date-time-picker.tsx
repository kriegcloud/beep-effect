"use client";

/**
 * MUI X date/time pickers backed by Effect `DateTime`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { applyTimezone, createDateTimeWithTimezone, createInvalidDateTime } from "@beep/schema/DateTimeUtcFromValid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import type { DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";
import type { LocalizationProviderProps } from "@mui/x-date-pickers/LocalizationProvider";
import type {
  AdapterFormats,
  AdapterOptions,
  DateBuilderReturnType,
  FieldFormatTokenMap,
  MuiPickersAdapter,
  PickersTimezone,
} from "@mui/x-date-pickers/models";
import type { TimePickerProps } from "@mui/x-date-pickers/TimePicker";

declare module "@mui/x-date-pickers/models" {
  interface PickerValidDateLookup {
    "effect-datetime": DateTime.DateTime;
  }
}

const formatTokenMap: FieldFormatTokenMap = {
  y: { sectionType: "year", contentType: "digit", maxLength: 4 },
  yy: { sectionType: "year", contentType: "digit", maxLength: 2 },
  yyy: { sectionType: "year", contentType: "digit", maxLength: 4 },
  yyyy: { sectionType: "year", contentType: "digit", maxLength: 4 },
  YYYY: { sectionType: "year", contentType: "digit", maxLength: 4 },
  M: { sectionType: "month", contentType: "digit", maxLength: 2 },
  MM: { sectionType: "month", contentType: "digit", maxLength: 2 },
  MMM: { sectionType: "month", contentType: "letter" },
  MMMM: { sectionType: "month", contentType: "letter" },
  L: { sectionType: "month", contentType: "digit", maxLength: 2 },
  LL: { sectionType: "month", contentType: "digit", maxLength: 2 },
  LLL: { sectionType: "month", contentType: "letter" },
  LLLL: { sectionType: "month", contentType: "letter" },
  d: { sectionType: "day", contentType: "digit", maxLength: 2 },
  dd: { sectionType: "day", contentType: "digit", maxLength: 2 },
  do: { sectionType: "day", contentType: "digit-with-letter" },
  D: { sectionType: "day", contentType: "digit", maxLength: 2 },
  DD: { sectionType: "day", contentType: "digit", maxLength: 2 },
  E: { sectionType: "weekDay", contentType: "letter" },
  EE: { sectionType: "weekDay", contentType: "letter" },
  EEE: { sectionType: "weekDay", contentType: "letter" },
  EEEE: { sectionType: "weekDay", contentType: "letter" },
  e: { sectionType: "weekDay", contentType: "digit", maxLength: 2 },
  ee: { sectionType: "weekDay", contentType: "digit", maxLength: 2 },
  eee: { sectionType: "weekDay", contentType: "letter" },
  eeee: { sectionType: "weekDay", contentType: "letter" },
  H: { sectionType: "hours", contentType: "digit", maxLength: 2 },
  HH: { sectionType: "hours", contentType: "digit", maxLength: 2 },
  h: { sectionType: "hours", contentType: "digit", maxLength: 2 },
  hh: { sectionType: "hours", contentType: "digit", maxLength: 2 },
  m: { sectionType: "minutes", contentType: "digit", maxLength: 2 },
  mm: { sectionType: "minutes", contentType: "digit", maxLength: 2 },
  s: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
  ss: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
  a: "meridiem",
  aa: "meridiem",
  A: "meridiem",
  AA: "meridiem",
  S: { sectionType: "seconds", contentType: "digit", maxLength: 1 },
  SS: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
  SSS: { sectionType: "seconds", contentType: "digit", maxLength: 3 },
};

const defaultFormats: AdapterFormats = {
  year: "yyyy",
  month: "LLLL",
  monthShort: "LLL",
  dayOfMonth: "d",
  dayOfMonthFull: "do",
  weekday: "EEEE",
  weekdayShort: "EEE",
  hours24h: "HH",
  hours12h: "hh",
  meridiem: "aa",
  minutes: "mm",
  seconds: "ss",
  fullDate: "PP",
  keyboardDate: "P",
  shortDate: "MMM d",
  normalDate: "d MMMM",
  normalDateWithWeekday: "EEE, MMM d",
  fullTime12h: "hh:mm aa",
  fullTime24h: "HH:mm",
  keyboardDateTime12h: "P hh:mm aa",
  keyboardDateTime24h: "P HH:mm",
};

const weekStartForLocale = (locale: string | undefined): 0 | 1 => {
  const mondayLocales = [
    "de",
    "fr",
    "es",
    "it",
    "pt",
    "ru",
    "pl",
    "nl",
    "sv",
    "da",
    "no",
    "fi",
    "cs",
    "sk",
    "hu",
    "ro",
    "bg",
    "el",
    "uk",
    "tr",
    "hr",
    "sl",
    "et",
    "lv",
    "lt",
    "vi",
  ];
  const localePrefix = pipe(
    locale ?? "en",
    Str.split("-"),
    A.head,
    O.map(Str.toLowerCase),
    O.getOrElse(() => "en")
  );
  return A.some(mondayLocales, (value) => value === localePrefix) ? 1 : 0;
};

const isBeforeDateTime = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
  value.epochMilliseconds < comparing.epochMilliseconds;

const isAfterDateTime = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
  value.epochMilliseconds > comparing.epochMilliseconds;

/**
 * MUI X adapter that lets pickers read and write Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { AdapterEffectDateTime } from "@beep/ui/components/effect-date-time-picker"
 *
 * console.log(AdapterEffectDateTime)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export class AdapterEffectDateTime implements MuiPickersAdapter<string> {
  public isMUIAdapter = true;
  public isTimezoneCompatible = true;
  public lib = "effect-datetime";
  public locale?: string;
  public formats: AdapterFormats;
  public escapedCharacters = { start: "'", end: "'" };
  public formatTokenMap = formatTokenMap;

  private readonly weekStartsOn: 0 | 1;

  constructor(options?: AdapterOptions<string, never> | undefined) {
    this.locale = options?.locale ?? "en-US";
    this.formats = { ...defaultFormats, ...options?.formats };
    this.weekStartsOn = weekStartForLocale(this.locale);
  }

  private toAdapterMonth(effectMonth: number): number {
    return effectMonth - 1;
  }

  private fromAdapterMonth(adapterMonth: number): number {
    return adapterMonth + 1;
  }

  private getDateTimePart(value: DateTime.DateTime, part: keyof DateTime.DateTime.PartsWithWeekday): number {
    return DateTime.getPart(value, part);
  }

  private formatStringToIntlOptions(formatString: string): Intl.DateTimeFormatOptions {
    const options: Intl.DateTimeFormatOptions = {};

    if (/yyyy|YYYY/u.test(formatString)) {
      options.year = "numeric";
    } else if (/yy|YY/u.test(formatString)) {
      options.year = "2-digit";
    }

    if (/MMMM|LLLL/u.test(formatString)) {
      options.month = "long";
    } else if (/MMM|LLL/u.test(formatString)) {
      options.month = "short";
    } else if (/MM|LL/u.test(formatString)) {
      options.month = "2-digit";
    } else if (/[ML]/u.test(formatString)) {
      options.month = "numeric";
    }

    if (/dd|DD/u.test(formatString)) {
      options.day = "2-digit";
    } else if (/[dD]/u.test(formatString)) {
      options.day = "numeric";
    }

    if (/EEEE|eeee/u.test(formatString)) {
      options.weekday = "long";
    } else if (/EEE|eee|E/u.test(formatString)) {
      options.weekday = "short";
    }

    if (/HH|H/u.test(formatString)) {
      options.hour = "2-digit";
      options.hour12 = false;
    } else if (/hh|h/u.test(formatString)) {
      options.hour = "2-digit";
      options.hour12 = true;
    }

    if (/mm|m/u.test(formatString)) {
      options.minute = "2-digit";
    }

    if (/ss|s/u.test(formatString)) {
      options.second = "2-digit";
    }

    if (formatString === "P" || formatString === "PP") {
      return { dateStyle: formatString === "PP" ? "medium" : "short" };
    }

    return options;
  }

  public date = <T extends string | null | undefined>(
    value?: T,
    timezone: PickersTimezone = "default"
  ): DateBuilderReturnType<T> => createDateTimeWithTimezone(value, timezone) as DateBuilderReturnType<T>;

  public getInvalidDate = (): DateTime.DateTime => createInvalidDateTime();

  public toJsDate = (value: DateTime.DateTime): Date => DateTime.toDate(value);

  public getTimezone = (value: DateTime.DateTime | null): PickersTimezone => {
    if (value === null) {
      return "default";
    }
    if (DateTime.isZoned(value)) {
      return DateTime.zoneToString(value.zone);
    }
    return "UTC";
  };

  public setTimezone = (value: DateTime.DateTime, timezone: PickersTimezone): DateTime.DateTime =>
    applyTimezone(value, timezone);

  public parse = (value: string, _format: string): DateTime.DateTime | null => {
    if (value === "") {
      return null;
    }

    return pipe(DateTime.make(value), O.getOrNull);
  };

  public format = (value: DateTime.DateTime, formatKey: keyof AdapterFormats): string =>
    this.formatByString(value, this.formats[formatKey]);

  public formatByString = (value: DateTime.DateTime, formatString: string): string => {
    if (!this.isValid(value)) {
      return "Invalid Date";
    }

    const date = DateTime.toDate(value);
    const locale = this.locale ?? "en-US";
    const options = this.formatStringToIntlOptions(formatString);

    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return date.toISOString();
    }
  };

  public formatNumber = (numberToFormat: string): string => {
    const rtlLocales = ["ar", "he", "fa", "ur"];
    const localePrefix = pipe(
      this.locale ?? "en",
      Str.split("-"),
      A.head,
      O.map(Str.toLowerCase),
      O.getOrElse(() => "en")
    );

    if (A.some(rtlLocales, (value) => value === localePrefix)) {
      try {
        return new Intl.NumberFormat(this.locale).format(Number(numberToFormat));
      } catch {
        return numberToFormat;
      }
    }

    return numberToFormat;
  };

  public expandFormat = (format: string): string => {
    const expansions: Record<string, string> = {
      P: "MM/dd/yyyy",
      PP: "MMM d, yyyy",
      PPP: "MMMM d, yyyy",
      PPPP: "EEEE, MMMM d, yyyy",
      p: "h:mm aa",
      pp: "h:mm:ss aa",
      ppp: "h:mm:ss aa",
      pppp: "h:mm:ss aa",
    };

    return format.replace(/P{1,4}|p{1,4}/gu, (match) => expansions[match] ?? match);
  };

  public isValid = (value: DateTime.DateTime | null): value is DateTime.DateTime =>
    value !== null && !Number.isNaN(value.epochMilliseconds);

  public getCurrentLocaleCode = (): string => this.locale ?? "en-US";

  public is12HourCycleInCurrentLocale = (): boolean => {
    const locale = this.getCurrentLocaleCode();
    try {
      const hourCycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
      return hourCycle === "h12" || hourCycle === "h11";
    } catch {
      return pipe(locale, Str.startsWith("en"));
    }
  };

  public getYear = (value: DateTime.DateTime): number => this.getDateTimePart(value, "year");

  public getMonth = (value: DateTime.DateTime): number => this.toAdapterMonth(this.getDateTimePart(value, "month"));

  public getDate = (value: DateTime.DateTime): number => this.getDateTimePart(value, "day");

  public getHours = (value: DateTime.DateTime): number => this.getDateTimePart(value, "hour");

  public getMinutes = (value: DateTime.DateTime): number => this.getDateTimePart(value, "minute");

  public getSeconds = (value: DateTime.DateTime): number => this.getDateTimePart(value, "second");

  public getMilliseconds = (value: DateTime.DateTime): number => this.getDateTimePart(value, "millisecond");

  public getDayOfWeek = (value: DateTime.DateTime): number => {
    const weekDay = this.getDateTimePart(value, "weekDay");
    return ((weekDay - this.weekStartsOn + 7) % 7) + 1;
  };

  public setYear = (value: DateTime.DateTime, year: number): DateTime.DateTime => DateTime.setParts(value, { year });

  public setMonth = (value: DateTime.DateTime, month: number): DateTime.DateTime =>
    DateTime.setParts(value, { month: this.fromAdapterMonth(month) });

  public setDate = (value: DateTime.DateTime, date: number): DateTime.DateTime =>
    DateTime.setParts(value, { day: date });

  public setHours = (value: DateTime.DateTime, hours: number): DateTime.DateTime =>
    DateTime.setParts(value, { hour: hours });

  public setMinutes = (value: DateTime.DateTime, minutes: number): DateTime.DateTime =>
    DateTime.setParts(value, { minute: minutes });

  public setSeconds = (value: DateTime.DateTime, seconds: number): DateTime.DateTime =>
    DateTime.setParts(value, { second: seconds });

  public setMilliseconds = (value: DateTime.DateTime, milliseconds: number): DateTime.DateTime =>
    DateTime.setParts(value, { millisecond: milliseconds });

  public isEqual = (value: DateTime.DateTime | null, comparing: DateTime.DateTime | null): boolean => {
    if (value === null && comparing === null) {
      return true;
    }
    return value !== null && comparing !== null && value.epochMilliseconds === comparing.epochMilliseconds;
  };

  public isSameYear = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    this.getYear(value) === this.getYear(comparing);

  public isSameMonth = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    this.isSameYear(value, comparing) && this.getMonth(value) === this.getMonth(comparing);

  public isSameDay = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    this.isSameMonth(value, comparing) && this.getDate(value) === this.getDate(comparing);

  public isSameHour = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    this.isSameDay(value, comparing) && this.getHours(value) === this.getHours(comparing);

  public isAfter = isAfterDateTime;

  public isAfterYear = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    this.getYear(value) > this.getYear(comparing);

  public isAfterDay = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    isAfterDateTime(this.startOfDay(value), this.endOfDay(comparing));

  public isBefore = isBeforeDateTime;

  public isBeforeYear = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    this.getYear(value) < this.getYear(comparing);

  public isBeforeDay = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean =>
    isBeforeDateTime(this.endOfDay(value), this.startOfDay(comparing));

  public isWithinRange = (value: DateTime.DateTime, [start, end]: [DateTime.DateTime, DateTime.DateTime]): boolean =>
    DateTime.between(value, { minimum: start, maximum: end });

  public startOfYear = (value: DateTime.DateTime): DateTime.DateTime => DateTime.startOf(value, "year");

  public startOfMonth = (value: DateTime.DateTime): DateTime.DateTime => DateTime.startOf(value, "month");

  public startOfWeek = (value: DateTime.DateTime): DateTime.DateTime =>
    DateTime.startOf(value, "week", { weekStartsOn: this.weekStartsOn });

  public startOfDay = (value: DateTime.DateTime): DateTime.DateTime => DateTime.startOf(value, "day");

  public endOfYear = (value: DateTime.DateTime): DateTime.DateTime => DateTime.endOf(value, "year");

  public endOfMonth = (value: DateTime.DateTime): DateTime.DateTime => DateTime.endOf(value, "month");

  public endOfWeek = (value: DateTime.DateTime): DateTime.DateTime =>
    DateTime.endOf(value, "week", { weekStartsOn: this.weekStartsOn });

  public endOfDay = (value: DateTime.DateTime): DateTime.DateTime => DateTime.endOf(value, "day");

  public addYears = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { years: amount });

  public addMonths = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { months: amount });

  public addWeeks = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { weeks: amount });

  public addDays = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { days: amount });

  public addHours = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { hours: amount });

  public addMinutes = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { minutes: amount });

  public addSeconds = (value: DateTime.DateTime, amount: number): DateTime.DateTime =>
    DateTime.add(value, { seconds: amount });

  public getDaysInMonth = (value: DateTime.DateTime): number => this.getDate(this.endOfMonth(value));

  public getWeekArray = (value: DateTime.DateTime): DateTime.DateTime[][] => {
    const start = this.startOfWeek(this.startOfMonth(value));
    const end = this.endOfWeek(this.endOfMonth(value));
    const weeks: DateTime.DateTime[][] = [];
    let current = start;

    while (current.epochMilliseconds <= end.epochMilliseconds) {
      const currentWeekIndex = Math.floor(
        (current.epochMilliseconds - start.epochMilliseconds) / (7 * 24 * 60 * 60 * 1000)
      );
      weeks[currentWeekIndex] ??= [];
      weeks[currentWeekIndex].push(current);
      current = this.addDays(current, 1);

      const lastWeek = weeks[weeks.length - 1];
      if (weeks.length >= 6 && lastWeek !== undefined && lastWeek.length >= 7) {
        break;
      }
    }

    return weeks;
  };

  public getWeekNumber = (value: DateTime.DateTime): number => {
    const startOfWeekValue = DateTime.startOf(value, "week", { weekStartsOn: 1 });
    const startOfYear = DateTime.startOf(value, "year");
    const jan1WeekDay = DateTime.getPart(startOfYear, "weekDay");
    const isoWeekDay = jan1WeekDay === 0 ? 7 : jan1WeekDay;
    const daysToFirstThursday = isoWeekDay <= 4 ? 4 - isoWeekDay : 11 - isoWeekDay;
    const firstThursday = DateTime.add(startOfYear, { days: daysToFirstThursday });
    const firstIsoWeekStart = DateTime.startOf(firstThursday, "week", { weekStartsOn: 1 });
    const weekNumber =
      Math.floor(
        (startOfWeekValue.epochMilliseconds - firstIsoWeekStart.epochMilliseconds) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;

    if (weekNumber < 1) {
      return this.getWeekNumber(DateTime.subtract(startOfYear, { days: 1 }));
    }

    return weekNumber;
  };

  public getYearRange = ([start, end]: [DateTime.DateTime, DateTime.DateTime]): DateTime.DateTime[] => {
    const startDate = this.startOfYear(start);
    const endDate = this.endOfYear(end);
    const years: DateTime.DateTime[] = [];
    let current = startDate;

    while (current.epochMilliseconds <= endDate.epochMilliseconds) {
      years.push(current);
      current = this.addYears(current, 1);
    }

    return years;
  };
}

type EffectDateTimeLocalizationProviderProps = Omit<
  LocalizationProviderProps<string>,
  "dateAdapter" | "dateLibInstance"
>;

/**
 * Localization provider preconfigured with {@link AdapterEffectDateTime}.
 *
 * @example
 * ```tsx
 * import { EffectDateTimeLocalizationProvider } from "@beep/ui/components/effect-date-time-picker"
 *
 * console.log(EffectDateTimeLocalizationProvider)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function EffectDateTimeLocalizationProvider(props: EffectDateTimeLocalizationProviderProps) {
  return <LocalizationProvider {...props} dateAdapter={AdapterEffectDateTime} />;
}

type ControlledPickerProps<TProps> = Omit<TProps, "value" | "defaultValue" | "onChange"> & {
  readonly defaultValue?: DateTime.DateTime | null | undefined;
  readonly onValueChange?: ((value: DateTime.DateTime | null) => void) | undefined;
  readonly value?: DateTime.DateTime | null | undefined;
};

/**
 * Date picker whose value is an Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { EffectDatePicker } from "@beep/ui/components/effect-date-time-picker"
 *
 * console.log(EffectDatePicker)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function EffectDatePicker({
  defaultValue,
  onValueChange,
  value,
  ...props
}: ControlledPickerProps<DatePickerProps>) {
  return (
    <EffectDateTimeLocalizationProvider>
      <DatePicker
        {...props}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(value !== undefined ? { value } : {})}
        onChange={(nextValue) => onValueChange?.(nextValue)}
      />
    </EffectDateTimeLocalizationProvider>
  );
}

/**
 * Date-time picker whose value is an Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { EffectDateTimePicker } from "@beep/ui/components/effect-date-time-picker"
 *
 * console.log(EffectDateTimePicker)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function EffectDateTimePicker({
  defaultValue,
  onValueChange,
  value,
  ...props
}: ControlledPickerProps<DateTimePickerProps>) {
  return (
    <EffectDateTimeLocalizationProvider>
      <DateTimePicker
        {...props}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(value !== undefined ? { value } : {})}
        onChange={(nextValue) => onValueChange?.(nextValue)}
      />
    </EffectDateTimeLocalizationProvider>
  );
}

/**
 * Time picker whose value is an Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { EffectTimePicker } from "@beep/ui/components/effect-date-time-picker"
 *
 * console.log(EffectTimePicker)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function EffectTimePicker({
  defaultValue,
  onValueChange,
  value,
  ...props
}: ControlledPickerProps<TimePickerProps>) {
  return (
    <EffectDateTimeLocalizationProvider>
      <TimePicker
        {...props}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(value !== undefined ? { value } : {})}
        onChange={(nextValue) => onValueChange?.(nextValue)}
      />
    </EffectDateTimeLocalizationProvider>
  );
}
