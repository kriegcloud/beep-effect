import { createInvalidDateTime } from "@beep/schema/DateTimeUtcFromValid";
import { AdapterEffectDateTime } from "@beep/ui/components/effect-date-time-picker";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Str from "effect/String";

const adapter = new AdapterEffectDateTime({ locale: "en-US" });

describe("AdapterEffectDateTime", () => {
  it("uses Effect v4 DateTime parts for getters and setters", () => {
    const value = DateTime.makeUnsafe("2024-02-03T04:05:06.007Z");
    const updated = adapter.setMilliseconds(
      adapter.setSeconds(adapter.setMinutes(adapter.setHours(value, 8), 9), 10),
      11
    );

    expect(adapter.getYear(value)).toBe(2024);
    expect(adapter.getMonth(value)).toBe(1);
    expect(adapter.getDate(value)).toBe(3);
    expect(adapter.getHours(value)).toBe(4);
    expect(adapter.getMinutes(value)).toBe(5);
    expect(adapter.getSeconds(value)).toBe(6);
    expect(adapter.getMilliseconds(value)).toBe(7);
    expect(DateTime.formatIso(updated)).toBe("2024-02-03T08:09:10.011Z");
  });

  it("includes the ending year in getYearRange", () => {
    const years = adapter.getYearRange([
      DateTime.makeUnsafe("2020-06-15T00:00:00.000Z"),
      DateTime.makeUnsafe("2022-01-01T00:00:00.000Z"),
    ]);

    expect(A.map(years, adapter.getYear)).toEqual([2020, 2021, 2022]);
  });

  it("creates invalid DateTime-shaped values for MUI validation", () => {
    const invalid = createInvalidDateTime();

    expect(adapter.isValid(invalid)).toBe(false);
    expect(adapter.isValid(undefined)).toBe(false);
    expect(adapter.isValid("" as unknown as DateTime.DateTime)).toBe(false);
    expect(Number.isNaN(invalid.epochMilliseconds)).toBe(true);
  });

  it("formats absent picker values as invalid instead of throwing", () => {
    expect(adapter.formatByString(undefined, "P")).toBe("Invalid Date");
    expect(adapter.formatByString("" as unknown as DateTime.DateTime, "P")).toBe("Invalid Date");
  });

  it("round-trips timezone tokens", () => {
    const zoned = adapter.setTimezone(DateTime.makeUnsafe("2024-01-01T00:00:00.000Z"), "Europe/London");

    expect(adapter.getTimezone(DateTime.makeUnsafe("2024-01-01T00:00:00.000Z"))).toBe("UTC");
    expect(adapter.getTimezone(zoned)).toBe("Europe/London");
  });

  it("uses MUI reference-date semantics for undefined adapter dates", () => {
    const referenceDate = adapter.date(undefined, "UTC");

    expect(DateTime.isDateTime(referenceDate)).toBe(true);
    expect(referenceDate !== null && DateTime.isUtc(referenceDate)).toBe(true);
  });

  it("formats clock field section tokens without meridiem leakage", () => {
    const value = DateTime.makeUnsafe("2024-02-03T03:05:09.000Z");
    const afternoon = DateTime.makeUnsafe("2024-02-03T15:30:00.000Z");
    const meridiem = adapter.formatByString(DateTime.makeUnsafe("2024-02-03T03:30:00.000Z"), "aa");

    expect(adapter.formatByString(value, "h")).toBe("3");
    expect(adapter.formatByString(value, "hh")).toBe("03");
    expect(adapter.formatByString(value, "H")).toBe("3");
    expect(adapter.formatByString(value, "HH")).toBe("03");
    expect(adapter.formatByString(value, "m")).toBe("5");
    expect(adapter.formatByString(value, "mm")).toBe("05");
    expect(adapter.formatByString(value, "s")).toBe("9");
    expect(adapter.formatByString(value, "ss")).toBe("09");
    expect(adapter.formatByString(afternoon, "h")).toBe("3");
    expect(adapter.formatByString(afternoon, "hh")).toBe("03");
    expect(meridiem).toMatch(/^(AM|PM)$/u);
    expect(adapter.formatByString(afternoon, "AA")).toBe(Str.toUpperCase(adapter.formatByString(afternoon, "aa")));
  });
});
