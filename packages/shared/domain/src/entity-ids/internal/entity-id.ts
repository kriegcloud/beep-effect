/**
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("EntityId");

/**
 * Maximum value for a PostgreSQL 4-byte serial column.
 *
 * @since 0.0.0
 */
export const PG_SERIAL_MAX = 2_147_483_647;

/**
 * Range filter constraining a number to the PostgreSQL serial range (1 to 2,147,483,647).
 *
 * @since 0.0.0
 */
export const isSerialRange = S.isBetween({ minimum: 1, maximum: PG_SERIAL_MAX });

/**
 * Branded schema for a PostgreSQL serial (auto-incrementing 4-byte signed integer).
 *
 * Validates:
 * - Safe integer (no fractional values)
 * - Minimum value of 1 (auto-increment starts at 1)
 * - Maximum value of 2,147,483,647 (4-byte signed integer upper bound)
 *
 * @since 0.0.0
 */
export const PgSerial = S.Int.check(isSerialRange).pipe(
  S.brand("PgSerial"),
  S.annotate(
    $I.annote("PgSerial", {
      description: "A PostgreSQL serial (auto-incrementing 4-byte integer, 1 to 2,147,483,647)",
    })
  )
);

/**
 * Type for {@link PgSerial}.
 *
 * @since 0.0.0
 */
export type PgSerial = typeof PgSerial.Type;
