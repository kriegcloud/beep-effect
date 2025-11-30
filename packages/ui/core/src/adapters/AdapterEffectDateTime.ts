/**
 * MUI X Date Pickers adapter for Effect DateTime.
 *
 * This adapter enables MUI date/time picker components to work natively with Effect's
 * immutable, timezone-aware DateTime type, eliminating conversion at component boundaries.
 *
 * @module
 */
import type {
  AdapterFormats,
  AdapterOptions,
  DateBuilderReturnType,
  FieldFormatTokenMap,
  MuiPickersAdapter,
  PickersTimezone,
} from "@mui/x-date-pickers/models";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import { flow, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { createDateTimeWithTimezone, createInvalidDateTime } from "./schema";

// Extend MUI's PickerValidDateLookup for type-safety
declare module "@mui/x-date-pickers/models" {
  interface PickerValidDateLookup {
    "effect-datetime": DateTime.DateTime;
  }
}

/**
 * Options for constructing the AdapterEffectDateTime.
 */
export interface AdapterEffectDateTimeOptions {
  /** BCP 47 locale string (e.g., "en-US", "fr-FR") */
  readonly locale?: undefined | string;
  /** Custom format strings to override defaults */
  readonly formats?: undefined | Partial<AdapterFormats>;
}

/**
 * Format token map for MUI field components.
 * Maps format tokens to field section types for editable field parsing.
 */
const formatTokenMap: FieldFormatTokenMap = {
  // Year
  y: { sectionType: "year", contentType: "digit", maxLength: 4 },
  yy: "year",
  yyy: { sectionType: "year", contentType: "digit", maxLength: 4 },
  yyyy: "year",
  YYYY: { sectionType: "year", contentType: "digit", maxLength: 4 },

  // Month
  M: { sectionType: "month", contentType: "digit", maxLength: 2 },
  MM: "month",
  MMM: { sectionType: "month", contentType: "letter" },
  MMMM: { sectionType: "month", contentType: "letter" },
  L: { sectionType: "month", contentType: "digit", maxLength: 2 },
  LL: "month",
  LLL: { sectionType: "month", contentType: "letter" },
  LLLL: { sectionType: "month", contentType: "letter" },

  // Day of month
  d: { sectionType: "day", contentType: "digit", maxLength: 2 },
  dd: "day",
  do: { sectionType: "day", contentType: "digit-with-letter" },
  D: { sectionType: "day", contentType: "digit", maxLength: 2 },
  DD: "day",

  // Day of week
  E: { sectionType: "weekDay", contentType: "letter" },
  EE: { sectionType: "weekDay", contentType: "letter" },
  EEE: { sectionType: "weekDay", contentType: "letter" },
  EEEE: { sectionType: "weekDay", contentType: "letter" },
  e: { sectionType: "weekDay", contentType: "digit", maxLength: 2 },
  ee: { sectionType: "weekDay", contentType: "digit", maxLength: 2 },
  eee: { sectionType: "weekDay", contentType: "letter" },
  eeee: { sectionType: "weekDay", contentType: "letter" },

  // Hours
  H: { sectionType: "hours", contentType: "digit", maxLength: 2 },
  HH: "hours",
  h: { sectionType: "hours", contentType: "digit", maxLength: 2 },
  hh: "hours",

  // Minutes
  m: { sectionType: "minutes", contentType: "digit", maxLength: 2 },
  mm: "minutes",

  // Seconds
  s: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
  ss: "seconds",

  // Meridiem
  a: "meridiem",
  aa: "meridiem",
  A: "meridiem",
  AA: "meridiem",

  // Milliseconds
  S: { sectionType: "seconds", contentType: "digit", maxLength: 1 },
  SS: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
  SSS: { sectionType: "seconds", contentType: "digit", maxLength: 3 },
};

/**
 * Default format strings for the adapter.
 * Uses standard format patterns compatible with Intl.DateTimeFormat.
 */
const defaultFormats: AdapterFormats = {
  // Token formats
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

  // Date formats
  fullDate: "PP",
  keyboardDate: "P",
  shortDate: "MMM d",
  normalDate: "d MMMM",
  normalDateWithWeekday: "EEE, MMM d",

  // Time formats
  fullTime12h: "hh:mm aa",
  fullTime24h: "HH:mm",

  // Date & time formats
  keyboardDateTime12h: "P hh:mm aa",
  keyboardDateTime24h: "P HH:mm",
};

/**
 * MUI X Date Pickers adapter for Effect DateTime.
 *
 * Implements the MuiPickersAdapter interface using Effect's DateTime module,
 * providing timezone-aware, immutable date operations for MUI components.
 */
export class AdapterEffectDateTime implements MuiPickersAdapter<string> {
  public isMUIAdapter = true as const;
  public isTimezoneCompatible = true;
  public lib = "effect-datetime";
  public locale?: string;
  public formats: AdapterFormats;
  public escapedCharacters = { start: "'", end: "'" };
  public formatTokenMap = formatTokenMap;

  // Cache for week start day based on locale
  private readonly weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;

  constructor(options?: undefined | AdapterOptions<string, never>) {
    this.locale = options?.locale ?? "en-US";
    this.formats = { ...defaultFormats, ...options?.formats };
    this.weekStartsOn = this.getWeekStartDay();
  }

  /**
   * Get the week start day for the current locale.
   * Different locales have different week start days (Sunday vs Monday).
   */
  private getWeekStartDay(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
    // Locales that start the week on Monday
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
    const localePrefix = this.locale?.split("-")[0]?.toLowerCase() ?? "en";
    return mondayLocales.includes(localePrefix) ? 1 : 0;
  }

  /**
   * Convert Effect DateTime 1-based month to MUI 0-based month.
   */
  private toAdapterMonth(effectMonth: number): number {
    return effectMonth - 1;
  }

  /**
   * Convert MUI 0-based month to Effect DateTime 1-based month.
   */
  private fromAdapterMonth(adapterMonth: number): number {
    return adapterMonth + 1;
  }

  /**
   * Get a part from a DateTime, handling both Utc and Zoned types.
   */
  private getDateTimePart(value: DateTime.DateTime, part: keyof DateTime.DateTime.PartsWithWeekday): number {
    return DateTime.getPart(value, part);
  }

  /**
   * Create a timezone for the given string identifier.
   */
  private getTimeZone(timezone: PickersTimezone): DateTime.TimeZone | undefined {
    if (timezone === "default" || timezone === "system") {
      return undefined; // Will use system timezone
    }
    if (timezone === "UTC") {
      return undefined; // Will create Utc type
    }
    return O.getOrUndefined(DateTime.zoneMakeNamed(timezone));
  }

  // =========================================================================
  // Date Creation & Conversion
  // =========================================================================

  /**
   * Create a DateTime from a string, null, or undefined value.
   *
   * Uses the schema helper `createDateTimeWithTimezone` for type-safe parsing.
   * The return type leverages MUI's module augmentation to ensure type compatibility.
   */
  public date = <T extends string | null | undefined>(
    value?: T,
    timezone: PickersTimezone = "default"
  ): DateBuilderReturnType<T> => {
    // Use the schema-based helper for type-safe DateTime creation
    const result = createDateTimeWithTimezone(value, timezone);

    // TypeScript needs help understanding the conditional return type.
    // Since we've extended PickerValidDateLookup with "effect-datetime": DateTime.DateTime,
    // and DateBuilderReturnType<T> = [T] extends [null] ? null : PickerValidDate,
    // the result is correctly typed but TypeScript can't prove it statically.
    return result as DateBuilderReturnType<T>;
  };

  /**
   * Create an invalid DateTime value.
   * Uses NaN for epochMillis to represent an invalid date.
   */
  public getInvalidDate = (): DateTime.DateTime => {
    return createInvalidDateTime();
  };

  public toJsDate = (value: DateTime.DateTime): Date => {
    return DateTime.toDate(value);
  };

  // =========================================================================
  // Timezone Operations
  // =========================================================================

  public getTimezone = (value: DateTime.DateTime | null): PickersTimezone => {
    if (value === null) {
      return "default";
    }
    if (DateTime.isZoned(value)) {
      const zone = value.zone;
      if (zone._tag === "Named") {
        return zone.id;
      }
      if (zone._tag === "Offset") {
        if (zone.offset === 0) {
          return "UTC";
        }
        // Format offset as timezone string
        const hours = Math.floor(Math.abs(zone.offset) / (60 * 60 * 1000));
        const minutes = Math.floor((Math.abs(zone.offset) % (60 * 60 * 1000)) / (60 * 1000));
        const sign = zone.offset >= 0 ? "+" : "-";
        return `${sign}${pipe(String(hours), Str.padStart(2, "0"))}:${pipe(String(minutes), Str.padStart(2, "0"))}`;
      }
    }
    return "UTC";
  };

  public setTimezone = (value: DateTime.DateTime, timezone: PickersTimezone): DateTime.DateTime => {
    if (timezone === "UTC") {
      return DateTime.toUtc(value);
    }

    if (timezone === "default" || timezone === "system") {
      const localZone = DateTime.zoneMakeLocal();
      return DateTime.setZone(value, localZone);
    }

    const zone = this.getTimeZone(timezone);
    if (zone) {
      return DateTime.setZone(value, zone);
    }

    return value;
  };

  // =========================================================================
  // Parsing & Formatting
  // =========================================================================

  public parse = (value: string, _format: string): DateTime.DateTime | null => {
    if (value === "") {
      return null;
    }

    const parsed = DateTime.make(value);
    if (O.isSome(parsed)) {
      return parsed.value;
    }

    // Try parsing as a date string more aggressively
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return DateTime.unsafeFromDate(date);
    }

    return null;
  };

  public format = (value: DateTime.DateTime, formatKey: keyof AdapterFormats): string => {
    return this.formatByString(value, this.formats[formatKey]);
  };

  public formatByString = (value: DateTime.DateTime, formatString: string): string => {
    if (!this.isValid(value)) {
      return "Invalid Date";
    }

    const date = DateTime.toDate(value);
    const locale = this.locale ?? "en-US";

    // Map format string to Intl.DateTimeFormatOptions
    const options = this.formatStringToIntlOptions(formatString);

    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      // Fallback to ISO format if Intl fails
      return date.toISOString();
    }
  };

  /**
   * Convert format string patterns to Intl.DateTimeFormatOptions.
   */
  private formatStringToIntlOptions(formatString: string): Intl.DateTimeFormatOptions {
    const options: Intl.DateTimeFormatOptions = {};

    // Year patterns
    if (/yyyy|YYYY/.test(formatString)) {
      options.year = "numeric";
    } else if (/yy|YY/.test(formatString)) {
      options.year = "2-digit";
    }

    // Month patterns
    if (/MMMM|LLLL/.test(formatString)) {
      options.month = "long";
    } else if (/MMM|LLL/.test(formatString)) {
      options.month = "short";
    } else if (/MM|LL/.test(formatString)) {
      options.month = "2-digit";
    } else if (/[ML]/.test(formatString)) {
      options.month = "numeric";
    }

    // Day patterns
    if (/dd|DD/.test(formatString)) {
      options.day = "2-digit";
    } else if (/[dD]/.test(formatString)) {
      options.day = "numeric";
    }

    // Weekday patterns
    if (/EEEE|eeee/.test(formatString)) {
      options.weekday = "long";
    } else if (/EEE|eee|E/.test(formatString)) {
      options.weekday = "short";
    }

    // Hour patterns
    if (/HH|H/.test(formatString)) {
      options.hour = "2-digit";
      options.hour12 = false;
    } else if (/hh|h/.test(formatString)) {
      options.hour = "2-digit";
      options.hour12 = true;
    }

    // Minute patterns
    if (/mm|m/.test(formatString)) {
      options.minute = "2-digit";
    }

    // Second patterns
    if (/ss|s/.test(formatString)) {
      options.second = "2-digit";
    }

    // Handle special format patterns
    if (formatString === "P" || formatString === "PP") {
      return { dateStyle: formatString === "PP" ? "medium" : "short" };
    }

    return options;
  }

  public formatNumber = (numberToFormat: string): string => {
    // For RTL locales, format numbers appropriately
    const rtlLocales = ["ar", "he", "fa", "ur"];
    const localePrefix = pipe(
      this.locale,
      O.fromNullable,
      O.flatMap(flow((locale) => locale, Str.split("-"), A.head)),
      O.map(Str.toLowerCase),
      O.getOrElse(() => "en")
    );

    if (rtlLocales.includes(localePrefix)) {
      try {
        return new Intl.NumberFormat(this.locale).format(Number(numberToFormat));
      } catch {
        return numberToFormat;
      }
    }

    return numberToFormat;
  };

  public expandFormat = (format: string): string => {
    // Expand meta-tokens like 'P' and 'PP' to actual format strings
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

    return format.replace(/P{1,4}|p{1,4}/g, (match) => expansions[match] ?? match);
  };

  // =========================================================================
  // Validation & Locale
  // =========================================================================

  public isValid = (value: DateTime.DateTime | null): value is DateTime.DateTime => {
    if (value === null) {
      return false;
    }
    return !Number.isNaN(value.epochMillis);
  };

  public getCurrentLocaleCode = (): string => {
    return this.locale ?? "en-US";
  };

  public is12HourCycleInCurrentLocale = (): boolean => {
    const locale = this.getCurrentLocaleCode();
    try {
      const hourCycle = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
      }).resolvedOptions().hourCycle;
      return hourCycle === "h12" || hourCycle === "h11";
    } catch {
      // Default to 12-hour for English locales, 24-hour otherwise
      return pipe(locale, Str.startsWith("en"));
    }
  };

  // =========================================================================
  // Getters
  // =========================================================================

  public getYear = (value: DateTime.DateTime): number => {
    return this.getDateTimePart(value, "year");
  };

  public getMonth = (value: DateTime.DateTime): number => {
    // Convert Effect 1-based month to MUI 0-based month
    return this.toAdapterMonth(this.getDateTimePart(value, "month"));
  };

  public getDate = (value: DateTime.DateTime): number => {
    return this.getDateTimePart(value, "day");
  };

  public getHours = (value: DateTime.DateTime): number => {
    return this.getDateTimePart(value, "hours");
  };

  public getMinutes = (value: DateTime.DateTime): number => {
    return this.getDateTimePart(value, "minutes");
  };

  public getSeconds = (value: DateTime.DateTime): number => {
    return this.getDateTimePart(value, "seconds");
  };

  public getMilliseconds = (value: DateTime.DateTime): number => {
    return this.getDateTimePart(value, "millis");
  };

  public getDayOfWeek = (value: DateTime.DateTime): number => {
    // MUI expects 1-7 (1 = first day of week based on locale)
    const weekDay = this.getDateTimePart(value, "weekDay"); // 0-6 (0 = Sunday)
    // Adjust based on locale's week start day
    const adjusted = (weekDay - this.weekStartsOn + 7) % 7;
    return adjusted + 1;
  };

  // =========================================================================
  // Setters
  // =========================================================================

  public setYear = (value: DateTime.DateTime, year: number): DateTime.DateTime => {
    return DateTime.setParts(value, { year });
  };

  public setMonth = (value: DateTime.DateTime, month: number): DateTime.DateTime => {
    // Convert MUI 0-based month to Effect 1-based month
    return DateTime.setParts(value, { month: this.fromAdapterMonth(month) });
  };

  public setDate = (value: DateTime.DateTime, date: number): DateTime.DateTime => {
    return DateTime.setParts(value, { day: date });
  };

  public setHours = (value: DateTime.DateTime, hours: number): DateTime.DateTime => {
    return DateTime.setParts(value, { hours });
  };

  public setMinutes = (value: DateTime.DateTime, minutes: number): DateTime.DateTime => {
    return DateTime.setParts(value, { minutes });
  };

  public setSeconds = (value: DateTime.DateTime, seconds: number): DateTime.DateTime => {
    return DateTime.setParts(value, { seconds });
  };

  public setMilliseconds = (value: DateTime.DateTime, milliseconds: number): DateTime.DateTime => {
    return DateTime.setParts(value, { millis: milliseconds });
  };

  // =========================================================================
  // Comparisons
  // =========================================================================

  public isEqual = (value: DateTime.DateTime | null, comparing: DateTime.DateTime | null): boolean => {
    if (value === null && comparing === null) {
      return true;
    }
    if (value === null || comparing === null) {
      return false;
    }
    return value.epochMillis === comparing.epochMillis;
  };

  public isSameYear = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return this.getYear(value) === this.getYear(comparing);
  };

  public isSameMonth = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return this.isSameYear(value, comparing) && this.getMonth(value) === this.getMonth(comparing);
  };

  public isSameDay = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return this.isSameMonth(value, comparing) && this.getDate(value) === this.getDate(comparing);
  };

  public isSameHour = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return this.isSameDay(value, comparing) && this.getHours(value) === this.getHours(comparing);
  };

  public isAfter = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return DateTime.greaterThan(value, comparing);
  };

  public isAfterYear = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return this.getYear(value) > this.getYear(comparing);
  };

  public isAfterDay = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    const valueStart = this.startOfDay(value);
    const comparingEnd = this.endOfDay(comparing);
    return DateTime.greaterThan(valueStart, comparingEnd);
  };

  public isBefore = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return DateTime.lessThan(value, comparing);
  };

  public isBeforeYear = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    return this.getYear(value) < this.getYear(comparing);
  };

  public isBeforeDay = (value: DateTime.DateTime, comparing: DateTime.DateTime): boolean => {
    const valueEnd = this.endOfDay(value);
    const comparingStart = this.startOfDay(comparing);
    return DateTime.lessThan(valueEnd, comparingStart);
  };

  public isWithinRange = (value: DateTime.DateTime, [start, end]: [DateTime.DateTime, DateTime.DateTime]): boolean => {
    return DateTime.between(value, { minimum: start, maximum: end });
  };

  // =========================================================================
  // Period Boundaries
  // =========================================================================

  public startOfYear = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.startOf(value, "year");
  };

  public startOfMonth = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.startOf(value, "month");
  };

  public startOfWeek = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.startOf(value, "week", { weekStartsOn: this.weekStartsOn });
  };

  public startOfDay = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.startOf(value, "day");
  };

  public endOfYear = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.endOf(value, "year");
  };

  public endOfMonth = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.endOf(value, "month");
  };

  public endOfWeek = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.endOf(value, "week", { weekStartsOn: this.weekStartsOn });
  };

  public endOfDay = (value: DateTime.DateTime): DateTime.DateTime => {
    return DateTime.endOf(value, "day");
  };

  // =========================================================================
  // Arithmetic
  // =========================================================================

  public addYears = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { years: amount });
  };

  public addMonths = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { months: amount });
  };

  public addWeeks = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { weeks: amount });
  };

  public addDays = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { days: amount });
  };

  public addHours = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { hours: amount });
  };

  public addMinutes = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { minutes: amount });
  };

  public addSeconds = (value: DateTime.DateTime, amount: number): DateTime.DateTime => {
    return DateTime.add(value, { seconds: amount });
  };

  // =========================================================================
  // Calendar Helpers
  // =========================================================================

  public getDaysInMonth = (value: DateTime.DateTime): number => {
    const endOfMonth = this.endOfMonth(value);
    return this.getDate(endOfMonth);
  };

  public getWeekArray = (value: DateTime.DateTime): DateTime.DateTime[][] => {
    const start = this.startOfWeek(this.startOfMonth(value));
    const end = this.endOfWeek(this.endOfMonth(value));

    const weeks: DateTime.DateTime[][] = [];
    let current = start;
    let weekIndex = 0;

    while (DateTime.lessThanOrEqualTo(current, end) || (weeks[weekIndex - 1]?.length ?? 0) < 7) {
      const currentWeekIndex = Math.floor((current.epochMillis - start.epochMillis) / (7 * 24 * 60 * 60 * 1000));

      if (!weeks[currentWeekIndex]) {
        weeks[currentWeekIndex] = [];
      }

      weeks[currentWeekIndex].push(current);
      current = this.addDays(current, 1);
      weekIndex = currentWeekIndex + 1;

      // Safety limit: max 6 weeks in a month view
      const lastWeek = weeks[weeks.length - 1];
      if (weeks.length >= 6 && lastWeek && lastWeek.length >= 7) {
        break;
      }
    }

    return weeks;
  };

  public getWeekNumber = (value: DateTime.DateTime): number => {
    // ISO 8601 week number: week 1 contains the first Thursday of the year
    const startOfWeekValue = DateTime.startOf(value, "week", { weekStartsOn: 1 }); // ISO weeks start Monday
    const startOfYear = DateTime.startOf(value, "year");

    // Find the first Thursday of the year (day 4 in ISO, where Monday = 1)
    const jan1WeekDay = DateTime.getPart(startOfYear, "weekDay"); // 0 = Sunday, 1 = Monday, etc.
    // Adjust to ISO weekday (1 = Monday, 7 = Sunday)
    const isoWeekDay = jan1WeekDay === 0 ? 7 : jan1WeekDay;
    // Days until first Thursday (ISO day 4)
    const daysToFirstThursday = isoWeekDay <= 4 ? 4 - isoWeekDay : 11 - isoWeekDay;
    const firstThursday = DateTime.add(startOfYear, { days: daysToFirstThursday });
    const firstIsoWeekStart = DateTime.startOf(firstThursday, "week", { weekStartsOn: 1 });

    // Calculate distance in weeks
    const distanceMs = DateTime.distance(firstIsoWeekStart, startOfWeekValue);
    const weekNumber = Math.floor(distanceMs / (7 * 24 * 60 * 60 * 1000)) + 1;

    // Handle edge case: dates before the first ISO week belong to the last week of the previous year
    if (weekNumber < 1) {
      // Recursively get week number for Dec 31 of previous year
      const prevYearEnd = DateTime.subtract(startOfYear, { days: 1 });
      return this.getWeekNumber(prevYearEnd);
    }

    return weekNumber;
  };

  public getYearRange = ([start, end]: [DateTime.DateTime, DateTime.DateTime]): DateTime.DateTime[] => {
    const startDate = this.startOfYear(start);
    const endDate = this.endOfYear(end);
    const years: DateTime.DateTime[] = [];

    let current = startDate;
    while (DateTime.lessThan(current, endDate)) {
      years.push(current);
      current = this.addYears(current, 1);
    }

    return years;
  };
}
