import { $SharedTablesId } from "@beep/identity/packages";
import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const $I = $SharedTablesId.create("columns/custom-datetime");

/**
 * Schema that accepts DateTimeUtcFromAllAcceptable encoded types
 * and transforms them to ISO string format for database storage.
 *
 * Input types: string | number | Date | DateTime.Utc
 * Output type: string (ISO 8601 format)
 */
const DateTimeToIsoString = S.transformOrFail(
  S.Union(S.String, S.Number, S.DateFromSelf, S.DateTimeUtcFromSelf),
  S.String,
  {
    strict: true,
    decode: (input, _, ast) =>
      Match.value(input).pipe(
        Match.when(DateTime.isDateTime, (dt) => ParseResult.succeed(DateTime.formatIso(dt))),
        Match.when(
          (v): v is Date => v instanceof Date,
          (d) => ParseResult.succeed(F.pipe(DateTime.unsafeFromDate(d), DateTime.formatIso))
        ),
        Match.when(S.is(S.Number), (n) => ParseResult.succeed(F.pipe(DateTime.unsafeMake(n), DateTime.formatIso))),
        Match.when(S.is(S.String), (str) =>
          F.pipe(
            DateTime.make(str),
            O.match({
              onNone: () => ParseResult.fail(new ParseResult.Type(ast, str, `Invalid datetime string: ${str}`)),
              onSome: (dt) => ParseResult.succeed(DateTime.formatIso(dt)),
            })
          )
        ),
        Match.exhaustive
      ),
    encode: (str) => ParseResult.succeed(str),
  }
).annotations(
  $I.annotations("DateTimeToIsoString", {
    description: "Transform various datetime formats to ISO 8601 string for PostgreSQL timestamp storage",
  })
);

/**
 * Convert any acceptable datetime input to an ISO string.
 * Used by toDriver to normalize values for database storage.
 */
const toIsoString = (value: string | number | Date | DateTime.Utc): string => S.decodeSync(DateTimeToIsoString)(value);

/**
 * Custom datetime column that accepts Effect Schema's DateTimeUtcFromAllAcceptable
 * encoded types and stores as PostgreSQL timestamp with time zone.
 *
 * This column bridges the type gap between Effect Schema's domain layer
 * (which uses `string | number | Date | DateTime.Utc`) and Drizzle's
 * database layer (which expects `string`).
 *
 * @remarks
 * Unlike `pg.timestamp()`, this custom type does not have a `.defaultNow()` method.
 * Use `.default(sql\`now()\`)` instead for SQL-level defaults.
 *
 * @example
 * ```typescript
 * import { datetime } from "@beep/shared-tables/columns";
 * import { sql } from "drizzle-orm";
 *
 * export const myTable = pgTable("my_table", {
 *   expiresAt: datetime("expires_at"),
 *   createdAt: datetime("created_at").default(sql`now()`).notNull(),
 * });
 * ```
 */
export const datetime = customType<{
  data: string | number | Date | DateTime.Utc;
  driverData: string;
}>({
  dataType() {
    return "timestamp with time zone";
  },
  toDriver(value: string | number | Date | DateTime.Utc): string {
    return toIsoString(value);
  },
  fromDriver(value: string): string {
    // Return as string for mode: "string" compatibility
    return value;
  },
});

/** SQL expression for `now()` to use as default value */
export const sqlNow = sql`now()`;

/** Input type for the datetime column */
export type DateTimeInput = string | number | Date | DateTime.Utc;
