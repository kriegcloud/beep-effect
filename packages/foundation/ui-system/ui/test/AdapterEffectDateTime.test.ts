import { AdapterEffectDateTime } from "@beep/ui/components/effect-date-time-picker";
import { describe, expect, it } from "@effect/vitest";
import * as DateTime from "effect/DateTime";
import * as A from "effect/Array";

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
    const invalid = adapter.getInvalidDate();

    expect(adapter.isValid(invalid)).toBe(false);
    expect(Number.isNaN(invalid.epochMilliseconds)).toBe(true);
  });

  it("round-trips timezone tokens", () => {
    const zoned = adapter.setTimezone(DateTime.makeUnsafe("2024-01-01T00:00:00.000Z"), "Europe/London");

    expect(adapter.getTimezone(DateTime.makeUnsafe("2024-01-01T00:00:00.000Z"))).toBe("UTC");
    expect(adapter.getTimezone(zoned)).toBe("Europe/London");
  });
});
