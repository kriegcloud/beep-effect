import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import {
  fAdd,
  fDate,
  fDateRangeShortLabel,
  fDateTime,
  fIsAfter,
  fIsBetween,
  fIsSame,
  fSub,
  fTime,
  fTimestamp,
  fToNow,
  today,
} from "@beep/utils/format-time";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

effect("date formatting helpers handle valid and invalid inputs", () =>
  Effect.gen(function* () {
    const now = DateTime.unsafeNow();
    const startOfDay = DateTime.startOf(now, "day");
    const parts = DateTime.toParts(startOfDay);
    const expectedToday = `${parts.year}-${parts.month.toString().padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;

    expect(today("YYYY-MM-DD")).toBe(expectedToday);
    expect(fDateTime(null)).toBe("Invalid date");
    expect(fDate("2024-01-02")).toContain("Jan 2024");
    expect(fTime("2024-01-02T12:00:00Z")).toContain("12");
    expect(typeof fTimestamp("2024-01-02")).toBe("number");
    expect(typeof fTimestamp("bad-date")).toBe("string");
  })
);

effect("relative and comparison helpers evaluate ranges correctly", () =>
  Effect.gen(function* () {
    const now = DateTime.unsafeNow();
    const past = DateTime.subtract(now, { minutes: 2 });
    const future = DateTime.add(now, { days: 1 });

    expect(fToNow(DateTime.toDate(past))).toContain("minute");
    expect(fIsBetween(DateTime.formatIso(now), DateTime.formatIso(past), DateTime.formatIso(future))).toBe(true);
    expect(fIsBetween("bad", DateTime.formatIso(past), DateTime.formatIso(future))).toBe(false);
    expect(fIsAfter(DateTime.formatIso(future), DateTime.formatIso(past))).toBe(true);
    expect(fIsAfter("bad", DateTime.formatIso(past))).toBe(false);

    const sameYearLater = DateTime.add(now, { hours: 1 });
    expect(fIsSame(DateTime.formatIso(now), DateTime.formatIso(sameYearLater), "year")).toBe(true);
    expect(fIsSame(DateTime.formatIso(now), DateTime.formatIso(future), "day")).toBe(false);
  })
);

effect("fDateRangeShortLabel condenses ranges and guards invalid sequences", () =>
  Effect.gen(function* () {
    const start = "2024-01-01";
    const end = "2024-01-05";
    const sameMonth = fDateRangeShortLabel(start, end);
    const singleDay = fDateRangeShortLabel(start, start);
    const initial = fDateRangeShortLabel(start, end, true);
    const invalid = fDateRangeShortLabel(end, start);

    expect(sameMonth).toBe("01 - 05 Jan 2024");
    expect(singleDay).toBe("01 Jan 2024");
    expect(initial).toBe("01 Jan 2024 - 05 Jan 2024");
    expect(invalid).toBe("Invalid date");
  })
);

effect("fAdd and fSub adjust relative to now", () =>
  Effect.gen(function* () {
    const now = DateTime.unsafeNow();
    const addedStr = fAdd({ days: 1, hours: 1 });
    const subtractedStr = fSub({ hours: 2 });

    const added = DateTime.unsafeMake(addedStr);
    const subtracted = DateTime.unsafeMake(subtractedStr);

    expect(DateTime.greaterThan(added, now)).toBe(true);
    expect(DateTime.lessThan(subtracted, now)).toBe(true);
  })
);

effect("temporal helpers consistently guard invalid inputs", () =>
  Effect.gen(function* () {
    expect(fDateTime(undefined)).toBe("Invalid date");
    expect(fDate(null)).toBe("Invalid date");
    expect(fTime(undefined)).toBe("Invalid date");
    expect(fToNow("invalid")).toBe("Invalid date");
    expect(fIsSame(undefined, undefined)).toBe(false);
  })
);
