import { $UiCoreId } from "@beep/identity/packages";
import type { PickersTimezone } from "@mui/x-date-pickers/models";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $UiCoreId.create("adapters/schema");

/**
 * Schema that transforms a nullable/optional string into DateTime | null.
 * This matches the MUI adapter's `date` method signature.
 *
 * - undefined → current DateTime (now)
 * - null → null
 * - string → parsed DateTime or invalid DateTime
 */
export const DateInputToDateTime = S.Union(S.Null, S.Undefined, S.String).annotations(
  $I.annotations("DateInput", { description: "Nullable/optional string that transforms into DateTime | null" })
);

export type DateInput = S.Schema.Type<typeof DateInputToDateTime>;

/**
 * Helper to create a DateTime with proper timezone handling.
 */
export const createDateTimeWithTimezone = (
  value: string | null | undefined,
  timezone: PickersTimezone
): DateTime.DateTime | null => {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    // Create current date/time
    const now = DateTime.unsafeNow();
    return applyTimezone(now, timezone);
  }

  // Parse string value
  const parsed = DateTime.make(value);
  if (O.isNone(parsed)) {
    // Return invalid DateTime for unparseable strings
    return DateTime.unsafeMake(Number.NaN);
  }

  return applyTimezone(parsed.value, timezone);
};

/**
 * Apply a timezone to a DateTime value.
 */
export const applyTimezone = (dt: DateTime.DateTime, timezone: PickersTimezone): DateTime.DateTime => {
  if (timezone === "UTC") {
    return DateTime.toUtc(dt);
  }

  if (timezone === "default" || timezone === "system") {
    const localZone = DateTime.zoneMakeLocal();
    return DateTime.setZone(dt, localZone);
  }

  // Named timezone
  const zone = O.getOrUndefined(DateTime.zoneMakeNamed(timezone));
  if (zone) {
    return DateTime.setZone(dt, zone);
  }

  return dt;
};

/**
 * Create an invalid DateTime (used for validation errors).
 */
export const createInvalidDateTime = (): DateTime.DateTime => {
  return DateTime.unsafeMake(Number.NaN);
};
