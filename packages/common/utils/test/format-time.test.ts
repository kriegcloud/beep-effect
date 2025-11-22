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
  formatPatterns,
  fSub,
  fTime,
  fTimestamp,
  fToNow,
  today,
} from "@beep/utils/format-time";
import dayjs from "dayjs";
import * as Effect from "effect/Effect";

effect("date formatting helpers handle valid and invalid inputs", () =>
  Effect.gen(function* () {
    const startOfDay = dayjs().startOf("day").format("YYYY-MM-DD");

    expect(today("YYYY-MM-DD")).toBe(startOfDay);
    expect(fDateTime(null)).toBe("Invalid date");
    expect(fDate("2024-01-02")).toBe(dayjs("2024-01-02").format(formatPatterns.date));
    expect(fTime("2024-01-02T12:00:00Z")).toBe(dayjs("2024-01-02T12:00:00Z").format(formatPatterns.time));
    expect(fTimestamp("2024-01-02")).toBe(dayjs("2024-01-02").valueOf());
    expect(typeof fTimestamp("bad-date")).toBe("string");
  })
);

effect("relative and comparison helpers evaluate ranges correctly", () =>
  Effect.gen(function* () {
    const now = dayjs();
    const past = now.subtract(2, "minute");
    const future = now.add(1, "day");

    expect(fToNow(past.toDate())).toContain("minute");
    expect(fIsBetween(now.toISOString(), past.toISOString(), future.toISOString())).toBe(true);
    expect(fIsBetween("bad", past.toISOString(), future.toISOString())).toBe(false);
    expect(fIsAfter(future.toISOString(), past.toISOString())).toBe(true);
    expect(fIsAfter("bad", past.toISOString())).toBe(false);
    expect(fIsSame(now.toISOString(), now.add(1, "month").toISOString(), "year")).toBe(true);
    expect(fIsSame(now.toISOString(), future.toISOString(), "day")).toBe(false);
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
    const added = dayjs(fAdd({ days: 1, hours: 1 }));
    const subtracted = dayjs(fSub({ hours: 2 }));
    const now = dayjs();

    expect(added.isAfter(now)).toBe(true);
    expect(subtracted.isBefore(now)).toBe(true);
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
