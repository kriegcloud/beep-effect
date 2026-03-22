/**
 * LocalDate - Date without timezone value object
 *
 * Represents a calendar date (year, month, day) without time or timezone information.
 * Uses Effect's DateTime.Utc internally but only represents the date portion.
 * Encodes to/from ISO 8601 date strings (YYYY-MM-DD format).
 *
 * @module @beep/schema/LocalDate
 * @since 0.0.0
 */
import {$SchemaId} from "@beep/identity";
import {
  DateTime, Duration, Effect, pipe, SchemaTransformation, SchemaIssue
} from "effect";
import {dual} from "effect/Function";
import * as O from "effect/Option";
import * as Order_ from "effect/Order";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("LocalDate");

/**
 * LocalDate - A S.Class representing a calendar date without time
 *
 * Stores year, month (1-12), and day (1-31) as numbers.
 * Encoded as ISO 8601 date string (YYYY-MM-DD).
 */
export class LocalDate extends S.Class<LocalDate>($I`LocalDate`)(
  {
    year: S.Int.check(S.makeFilterGroup([
      S.isGreaterThanOrEqualTo(1),
      S.isLessThanOrEqualTo(9999)
    ])),
    month: S.Int.check(S.makeFilterGroup([
      S.isGreaterThanOrEqualTo(1),
      S.isLessThanOrEqualTo(12)
    ])),
    day: S.Int.check(S.makeFilterGroup([
      S.isGreaterThanOrEqualTo(1),
      S.isLessThanOrEqualTo(31)
    ]))
  },
  $I.annote(
    "LocalDate",
    {
      description: "LocalDate - A S.Class representing a calendar date without time",
      documentation: "Stores year, month (1-12), and day (1-31) as numbers.\nEncoded as ISO 8601 date string (YYYY-MM-DD)."
    }
  )
) {
  /**
   * Format as ISO 8601 date string (YYYY-MM-DD)
   *
   * @returns {string}
   * @since 0.0.0
   * @category Utility
   */
  toISOString(): string {
    const y = Str.padStart(
      4,
      "0"
    )(
      this.year.toString());
    const m = Str.padStart(
      2,
      "0"
    )(
      this.month.toString());
    const d = Str.padStart(
      2,
      "0"
    )(
      this.day.toString());
    return `${y}-${m}-${d}`;
  }

  /**
   * Convert to string representation
   * @returns {string}
   * @since 0.0.0
   * @category Utility
   */
  override readonly toString = (): string => {
    return this.toISOString();
  };

  /**
   * Convert to Effect DateTime.Utc at midnight UTC
   * @returns {DateTime.Utc}
   * @since 0.0.0
   * @category Utility
   */
  toDateTime(): DateTime.Utc {
    return DateTime.makeUnsafe({
      year: this.year,
      month: this.month,
      day: this.day
    });
  }

  /**
   * Convert to JavaScript Date at midnight UTC
   * @returns {Date}
   * @since 0.0.0
   * @category Utility
   */
  readonly toDate = (): Date => {
    return new Date(Date.UTC(
      this.year,
      this.month - 1,
      this.day
    ));
  };
}

/**
 * Type guard for LocalDate using S.is
 *
 * @category Utility
 * @since 0.0.0
 * @type {<I>(input: I) => input is any}
 */
export const isLocalDate = S.is(LocalDate);

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const decodeLocalDate = S.decodeUnknownEffect(LocalDate);

const makeInvalidLocalDateError: {
  (message: string): (dateString: string) => S.SchemaError;
  (
    dateString: string,
    message: string
  ): S.SchemaError;
} = dual(
  2,
  (
    dateString: string,
    message: string
  ): S.SchemaError => new S.SchemaError(new SchemaIssue.InvalidValue(
    O.some(dateString),
    {message}
  ))
);

const isValidCalendarDate = ({
                               year,
                               month,
                               day
                             }: {
  year: number;
  month: number;
  day: number
}): boolean => {
  const date = new Date(0);

  date.setUTCHours(
    0,
    0,
    0,
    0
  );
  date.setUTCFullYear(
    year,
    month - 1,
    day
  );

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

/**
 * Create a LocalDate from an ISO 8601 date string (YYYY-MM-DD)
 * Returns an Effect that may fail with ParseError
 *
 * @category Utility
 * @since 0.0.0
 * @param {string} dateString
 * @returns {Effect<LocalDate, S.SchemaError>}
 */
export const fromString = (dateString: string): Effect.Effect<LocalDate, S.SchemaError> => O.match(
  Str.match(ISO_DATE_PATTERN)(
    dateString),
  {
    onNone: () => Effect.fail(makeInvalidLocalDateError(
      dateString,
      "Expected an ISO 8601 local date in YYYY-MM-DD format"
    )),
    onSome: ([, yearString, monthString, dayString]) => {
      const parts = {
        year: Number.parseInt(
          yearString,
          10
        ),
        month: Number.parseInt(
          monthString,
          10
        ),
        day: Number.parseInt(
          dayString,
          10
        )
      };

      return isValidCalendarDate(parts)
             ? decodeLocalDate(parts)
             : Effect.fail(makeInvalidLocalDateError(
          dateString,
          "Invalid calendar date"
        ));
    }
  }
);

/**
 * Create a LocalDate from a JavaScript Date
 * Uses the UTC date components
 *
 * @category Utility
 * @since 0.0.0
 * @param {Date} date
 * @returns {LocalDate}
 */
export const fromDate = (date: Date): LocalDate => pipe(
  date,
  DateTime.fromDateUnsafe,
  DateTime.toPartsUtc,
  (parts) => LocalDate.makeUnsafe({
    year: parts.year,
    month: parts.month + 1,
    day: parts.day
  })
);

/**
 * Get the current date (UTC)
 *
 * @category Utility
 * @since 0.0.0
 * @returns {LocalDate}
 */
export const today = (): LocalDate => DateTime.nowUnsafe()
.pipe(
  DateTime.toDate,
  fromDate
);

/**
 * Get the current date (UTC) as an Effect using the Clock service
 * This is testable with TestClock
 *
 * @category Utility
 * @since 0.0.0
 * @type {Effect<LocalDate, E, R>}
 */
export const todayEffect = pipe(
  Effect.clockWith((clock) => clock.currentTimeMillis),
  Effect.map((millis) => DateTime.makeUnsafe(Number(millis))
  .pipe(
    DateTime.toDate,
    fromDate
  ))
);

/**
 * LocalDate.ts
 * urlpath.ts
 *
 * @category Utility
 * @since 0.0.0
 * @param {DateTime} dateTime
 * @returns {LocalDate}
 */
export const fromDateTime = (dateTime: DateTime.DateTime): LocalDate => {
  const parts = DateTime.toPartsUtc(dateTime);
  return LocalDate.makeUnsafe({
    year: parts.year,
    month: parts.month,
    day: parts.day
  });
};

/**
 * Order for LocalDate - compares chronologically
 *
 * @category Utility
 * @since 0.0.0
 * @type {Order<LocalDate>}
 */
export const Order: Order_.Order<LocalDate> = Order_.make((
  a,
  b
) => {
  if (a.year !== b.year) {
    return a.year < b.year
           ? -1
           : 1;
  }
  if (a.month !== b.month) {
    return a.month < b.month
           ? -1
           : 1;
  }
  if (a.day !== b.day) {
    return a.day < b.day
           ? -1
           : 1;
  }
  return 0;
});

/**
 * Check if first date is before second
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} a
 * @param {LocalDate} b
 * @returns {boolean}
 */
export const isBefore: {
  (that: LocalDate): (self: LocalDate) => boolean;
  (
    self: LocalDate,
    that: LocalDate
  ): boolean;
} = dual(
  2,
  (
    self: LocalDate,
    that: LocalDate
  ): boolean => Order(
    self,
    that
  ) === -1
);

/**
 * Check if first date is after second
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} a
 * @param {LocalDate} b
 * @returns {boolean}
 */
export const isAfter: {
  (that: LocalDate): (self: LocalDate) => boolean;
  (
    self: LocalDate,
    that: LocalDate
  ): boolean;
} = dual(
  2,
  (
    self: LocalDate,
    that: LocalDate
  ): boolean => Order(
    self,
    that
  ) === 1
);

/**
 * Check if two dates are equal
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} a
 * @param {LocalDate} b
 * @returns {boolean}
 */
export const equals: {
  (that: LocalDate): (self: LocalDate) => boolean;
  (
    self: LocalDate,
    that: LocalDate
  ): boolean;
} = dual(
  2,
  (
    self: LocalDate,
    that: LocalDate
  ): boolean => self.year === that.year && self.month === that.month && self.day === that.day
);

/**
 * Add days to a LocalDate
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} date
 * @param {number} days
 * @returns {LocalDate}
 */
export const addDays: {
  (days: number): (self: LocalDate) => LocalDate;
  (
    self: LocalDate,
    days: number
  ): LocalDate;
} = dual(
  2,
  (
    self: LocalDate,
    days: number
  ): LocalDate => pipe(
    self.toDate(),
    DateTime.fromDateUnsafe,
    DateTime.toUtc,
    DateTime.add({days}),
    DateTime.toDate,
    fromDate
  )
);

/**
 * Add months to a LocalDate
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} date
 * @param {number} months
 * @returns {LocalDate}
 */
export const addMonths: {
  (months: number): (self: LocalDate) => LocalDate;
  (
    self: LocalDate,
    months: number
  ): LocalDate;
} = dual(
  2,
  (
    self: LocalDate,
    months: number
  ): LocalDate => pipe(
    self.toDate(),
    DateTime.fromDateUnsafe,
    DateTime.toUtc,
    DateTime.add({months}),
    DateTime.toDate,
    fromDate
  )
);

/**
 * Add years to a LocalDate
 *
 * @param {LocalDate} date
 * @param {number} years
 * @returns {LocalDate}
 */
export const addYears: {
  (years: number): (self: LocalDate) => LocalDate;
  (
    self: LocalDate,
    years: number
  ): LocalDate;
} = dual(
  2,
  (
    self: LocalDate,
    years: number
  ): LocalDate => pipe(
    self.toDate(),
    DateTime.fromDateUnsafe,
    DateTime.toUtc,
    DateTime.add({years}),
    DateTime.toDate,
    fromDate
  )
);

/**
 * Get the difference in days between two dates
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} a
 * @param {LocalDate} b
 * @returns {number}
 */
export const diffInDays: {
  (that: LocalDate): (self: LocalDate) => number;
  (
    self: LocalDate,
    that: LocalDate
  ): number;
} = dual(
  2,
  (
    self: LocalDate,
    that: LocalDate
  ): number => {
    const msPerDay = Duration.days(1)
    .pipe(Duration.toMillis);
    const dateA = self.toDate();
    const dateB = that.toDate();
    return Math.round((dateA.getTime() - dateB.getTime()) / msPerDay);
  }
);

/**
 * Get the start of the month for a LocalDate
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} date
 * @returns {LocalDate}
 */
export const startOfMonth = (date: LocalDate): LocalDate => {
  return LocalDate.makeUnsafe({
    year: date.year,
    month: date.month,
    day: 1
  });
};

/**
 * Get the end of the month for a LocalDate
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} date
 * @returns {LocalDate}
 */
export const endOfMonth = (date: LocalDate): LocalDate => {
  const d = new Date(Date.UTC(
    date.year,
    date.month,
    0
  ));
  return fromDate(d);
};

/**
 * Get the start of the year for a LocalDate
 *
 * @category Utility
 * @since 0.0.0
 * @param {LocalDate} date
 * @returns {LocalDate}
 */
export const startOfYear = (date: LocalDate): LocalDate => {
  return LocalDate.makeUnsafe({
    year: date.year,
    month: 1,
    day: 1
  });
};

/**
 * Get the end of the year for a LocalDate
 *
 * @param {LocalDate} date
 * @returns {LocalDate}
 */
export const endOfYear = (date: LocalDate): LocalDate => {
  return LocalDate.makeUnsafe({
    year: date.year,
    month: 12,
    day: 31
  });
};

/**
 * Check if a year is a leap year
 *
 * @category Utility
 * @since 0.0.0
 * @param {number} year
 * @returns {boolean}
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Get the number of days in a month
 *
 * @category Utility
 * @since 0.0.0
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export const daysInMonth: {
  (month: number): (year: number) => number;
  (
    year: number,
    month: number
  ): number;
} = dual(
  2,
  (
    year: number,
    month: number
  ): number => new Date(Date.UTC(
    year,
    month,
    0
  )).getUTCDate()
);


/**
 * Regular expression for ISO 8601 date format (YYYY-MM-DD)
 */

/**
 * LocalDateFromString - Schema that transforms ISO date strings (YYYY-MM-DD) to LocalDate
 *
 * This schema can be used directly in API URL params, request bodies, and database columns
 * to automatically parse date strings into LocalDate instances.
 *
 * @example
 * ```ts
 * // In API URL params
 * const params = S.Struct({
 *   asOfDate: LocalDateFromString
 * })
 *
 * // Decoding
 * const date = yield* S.decodeUnknown(LocalDateFromString)("2024-06-15")
 * // date is now LocalDate { year: 2024, month: 6, day: 15 }
 *
 * // Encoding
 * const str = yield* S.encode(LocalDateFromString)(date)
 * // str is "2024-06-15"
 * ```
 */



export const LocalDateFromString = S.String.pipe(
  S.decodeTo(
    LocalDate,
    SchemaTransformation.transformOrFail({
      decode: (dateString) => {
        const match = dateString.match(ISO_DATE_PATTERN);
        if (P.isNullish(match)) {
          return Effect.fail(new SchemaIssue.InvalidValue(O.some(dateString)));
        }
        const [, yearStr, monthStr, dayStr] = match;
        const year = parseInt(
          yearStr,
          10
        );
        const month = parseInt(
          monthStr,
          10
        );
        const day = parseInt(
          dayStr,
          10
        );

        // Validate month range
        if (month < 1 || month > 12) {
          return Effect.fail(new SchemaIssue.InvalidType(
            S.String.ast,
            O.some(dateString)
          ));

        }

        // Validate day range for the given month
        const maxDays = daysInMonth(
          year,
          month
        );
        if (day < 1 || day > maxDays) {
          return Effect.fail(new SchemaIssue.InvalidType(
            S.String.ast,
            O.some(dateString)
          ));
        }

        return Effect.succeed({
          year,
          month,
          day
        });
      },
      encode: (localDate) => {
        // Format as ISO 8601 date string (YYYY-MM-DD)
        const y = String(localDate.year)
        .padStart(
          4,
          "0"
        );
        const m = String(localDate.month)
        .padStart(
          2,
          "0"
        );
        const d = String(localDate.day)
        .padStart(
          2,
          "0"
        );
        return Effect.succeed(`${y}-${m}-${d}`);
      }
    })
  ),
  $I.annoteSchema(
    "LocalDateFromString",
    {
      description: "LocalDateFromString - Schema that transforms ISO date strings (YYYY-MM-DD) to LocalDate",
      documentation: "This schema can be used directly in API URL params, request bodies, and database columns\nto automatically parse date strings into LocalDate instances.\n\n@example\n```ts\n// In API URL params\nconst params = S.Struct({\n  asOfDate: LocalDateFromString\n})\n\n// Decoding\nconst date = yield* S.decodeUnknown(LocalDateFromString)(\"2024-06-15\")\n// date is now LocalDate { year: 2024, month: 6, day: 15 }\n\n// Encoding\nconst str = yield* S.encode(LocalDateFromString)(date)\n// str is \"2024-06-15\"\n```"
    }
  )
);

/**
 * The `LocalDateFromString` utility provides a schema to parse and validate strings representing local dates
 * (formatted as YYYY-MM-DD) into an appropriate date object while maintaining type safety.
 *
 * This utility is particularly useful when working with APIs or datasets that represent dates as ISO 8601 formatted strings,
 * but for which you want typed validation and runtime parsing into `LocalDate`.
 *
 * @example
 * ```ts-morph
 * import * as S from "effect/Schema";
 * import { LocalDateFromString } from "your-library-path"; // Replace with actual implementation
 *
 * const parseDate = LocalDateFromString.encode("2023-10-05");
 * console.log(parseDate); // Logs a successfully parsed LocalDate object, e.g., `{ year: 2023, month: 10, day: 5 }`
 * ```
 *
 * @example
 * ```ts-morph
 * import * as S from "effect/Schema";
 * import { LocalDateFromString } from "your-library-path"; // Replace with actual implementation
 *
 * const schema = LocalDateFromString;
 *
 * const result = schema.decode("2023-10-05");
 * console.log(result); // { success: true, value: { year: 2023, month: 10, day: 5 } }
 *
 * const invalidResult = schema.decode("invalid-date");
 * console.log(invalidResult); // { success: false, error: [ValidationError details] }
 * ```
 *
 * @since 0.0.0
 * @category schema
 */
export type LocalDateFromString = typeof LocalDateFromString.Type;

/**
 *
 */
export declare namespace LocalDateFromString {
  /**
   * Represents an encoded version of a structure or type, typically used in schema encoding scenarios.
   *
   * This type is derived from the `LocalDateFromString.Encoded` type, which ensures a consistent format
   * and validation mechanism when working with encoded representations of `LocalDate` values. It is
   * commonly utilized in scenarios where encoded types are required for serialization, storage, or
   * data transformation.
   *
   * ## Key Features
   * - Guarantees adherence to `LocalDateFromString.Encoded` format.
   * - Highly compatible with schema-based operations, such as decoding and transformation.
   * - Promotes type safety in data handling workflows.
   *
   * @example
   * ```ts-morph
   * import { LocalDateFromString, Encoded } from "effect";
   *
   * type MyEncodedType = Encoded;
   *
   * const encodedExample: Encoded = "2023-03-15";
   * console.log(encodedExample); // Output: 2023-03-15
   * ```
   *
   * @since 0.0.0
   * @category models
   */
  export type Encoded = typeof LocalDateFromString.Encoded;
}
