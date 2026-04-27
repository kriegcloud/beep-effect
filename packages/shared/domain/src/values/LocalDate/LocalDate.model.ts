/**
 * LocalDate value object model.
 *
 * Defines the schema-backed class used by the LocalDate behavior module. A
 * LocalDate stores only UTC calendar fields and deliberately carries no time
 * zone or clock-time component.
 *
 * @module
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity";
import { DateTime, Hash } from "effect";
import * as Eq from "effect/Equal";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SharedDomainId.create("values/LocalDate/LocalDate.model");

/**
 * Schema class representing a calendar date without time or timezone.
 *
 * Stores year, month, and day as integer fields. Calendar-day validation that
 * depends on both month and year is handled by the string boundary in the
 * behavior module.
 *
 * @example
 * ```ts
 * import { Model } from "@beep/shared-domain/values/LocalDate/index"
 *
 * const date = Model.make({ year: 2024, month: 6, day: 15 })
 *
 * console.log(date.toISOString()) // "2024-06-15"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Model extends S.Class<Model>($I`LocalDateModel`)(
  {
    year: S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(9999)])),
    month: S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(12)])),
    day: S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(31)])),
  },
  $I.annote("LocalDateModel", {
    description: "Schema class representing a calendar date without time or timezone.",
    documentation: "Stores year, month, and day as integer fields and formats them as YYYY-MM-DD.",
  })
) {
  /**
   * Format the date as an ISO 8601 local-date string.
   *
   * @example
   * ```ts
   * import { Model } from "@beep/shared-domain/values/LocalDate/index"
   *
   * const date = Model.make({ year: 99, month: 2, day: 5 })
   *
   * console.log(date.toISOString()) // "0099-02-05"
   * ```
   *
   * @category utilities
   * @returns ISO 8601 local-date text in `YYYY-MM-DD` format.
   * @since 0.0.0
   */
  toISOString(): string {
    const year = Str.padStart(4, "0")(`${this.year}`);
    const month = Str.padStart(2, "0")(`${this.month}`);
    const day = Str.padStart(2, "0")(`${this.day}`);
    return `${year}-${month}-${day}`;
  }

  /**
   * Convert the date to its canonical string representation.
   *
   * @example
   * ```ts
   * import { Model } from "@beep/shared-domain/values/LocalDate/index"
   *
   * const date = Model.make({ year: 2024, month: 6, day: 15 })
   *
   * console.log(date.toString()) // "2024-06-15"
   * ```
   *
   * @category utilities
   * @returns ISO 8601 local-date text in `YYYY-MM-DD` format.
   * @since 0.0.0
   */
  override readonly toString = (): string => this.toISOString();

  /**
   * Compare two LocalDate values by calendar fields.
   *
   * @example
   * ```ts
   * import { Equal } from "effect"
   * import { Model } from "@beep/shared-domain/values/LocalDate/index"
   *
   * const left = Model.make({ year: 2024, month: 6, day: 15 })
   * const right = Model.make({ year: 2024, month: 6, day: 15 })
   *
   * console.log(Equal.equals(left, right)) // true
   * ```
   *
   * @category utilities
   * @param that - Value to compare with this LocalDate.
   * @returns `true` when both dates have the same year, month, and day.
   * @since 0.0.0
   */
  [Eq.symbol](that: Eq.Equal): boolean {
    return S.is(Model)(that) && this.year === that.year && this.month === that.month && this.day === that.day;
  }

  /**
   * Compute a stable hash from the canonical ISO date string.
   *
   * @example
   * ```ts
   * import { Hash } from "effect"
   * import { Model } from "@beep/shared-domain/values/LocalDate/index"
   *
   * const date = Model.make({ year: 2024, month: 6, day: 15 })
   *
   * console.log(Hash.hash(date) === Hash.string("2024-06-15")) // true
   * ```
   *
   * @category utilities
   * @returns Stable hash code for the LocalDate.
   * @since 0.0.0
   */
  [Hash.symbol](): number {
    return Hash.string(this.toISOString());
  }

  /**
   * Convert the date to an Effect `DateTime.Utc` at midnight UTC.
   *
   * @example
   * ```ts
   * import * as DateTime from "effect/DateTime"
   * import { Model } from "@beep/shared-domain/values/LocalDate/index"
   *
   * const date = Model.make({ year: 2024, month: 6, day: 15 })
   * const parts = DateTime.toPartsUtc(date.toDateTime())
   *
   * console.log(parts.hour) // 0
   * ```
   *
   * @category utilities
   * @returns Effect `DateTime.Utc` for midnight at the start of the date.
   * @since 0.0.0
   */
  toDateTime(): DateTime.Utc {
    return DateTime.makeUnsafe({
      year: this.year,
      month: this.month,
      day: this.day,
    });
  }

  /**
   * Convert the date to a JavaScript `Date` at midnight UTC.
   *
   * @example
   * ```ts
   * import { Model } from "@beep/shared-domain/values/LocalDate/index"
   *
   * const date = Model.make({ year: 2024, month: 6, day: 15 })
   *
   * console.log(date.toDate().toISOString()) // "2024-06-15T00:00:00.000Z"
   * ```
   *
   * @category utilities
   * @returns JavaScript `Date` for midnight at the start of the LocalDate.
   * @since 0.0.0
   */
  readonly toDate = (): Date => DateTime.toDateUtc(this.toDateTime());
}
