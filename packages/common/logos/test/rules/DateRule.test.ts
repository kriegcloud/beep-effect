// If you export DateRule from v2 under this path, great; otherwise adjust the import:
import { DateRule } from "@beep/logos/v2/rules";
import * as DateTime from "effect/DateTime";
import { describe, expect, test } from "vitest";

const u = (iso: string) => DateTime.unsafeFromDate(new Date(iso));
const ms = (iso: string) => Date.parse(iso);

// Simple helper for readability
const field = "createdAt";

describe("DateRule.validate", () => {
  // ──────────────────────────────────────────────────────────────
  // eq / ne
  // ──────────────────────────────────────────────────────────────
  test("eq — true when exact instant matches (string input)", () => {
    const rule = DateRule.eq({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeTruthy();
  });

  test("eq — false when instants differ", () => {
    const rule = DateRule.eq({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:01Z")).toBeFalsy();
  });

  test("ne — true when instants differ", () => {
    const rule = DateRule.ne({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:01Z")).toBeTruthy();
  });

  test("ne — false when instants match", () => {
    const rule = DateRule.ne({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeFalsy();
  });

  // ──────────────────────────────────────────────────────────────
  // gt / gte / lt / lte
  // (remember: our validate implements gt as value > op.value, etc.)
  // ──────────────────────────────────────────────────────────────
  test("gt — value strictly after op.value", () => {
    const rule = DateRule.gt({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:01Z")).toBeTruthy();
  });

  test("gt — false when equal", () => {
    const rule = DateRule.gt({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeFalsy();
  });

  test("gte — true when after or equal", () => {
    const rule = DateRule.gte({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:01Z")).toBeTruthy();
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeTruthy();
  });

  test("lt — value strictly before op.value", () => {
    const rule = DateRule.lt({
      field,
      value: u("2025-01-01T00:00:01Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeTruthy();
  });

  test("lte — true when before or equal", () => {
    const rule = DateRule.lte({
      field,
      value: u("2025-01-01T00:00:01Z"),
    });
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeTruthy();
    expect(DateRule.validate(rule, "2025-01-01T00:00:01Z")).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────
  // Same UTC hour / day / week (ISO) / month / year
  // ──────────────────────────────────────────────────────────────
  test("isSameHour — true within same UTC hour", () => {
    const rule = DateRule.isSameHour({
      field,
      value: u("2025-06-01T10:05:00Z"),
    });
    expect(DateRule.validate(rule, "2025-06-01T10:59:59Z")).toBeTruthy();
  });

  test("isSameHour — false across hour boundary", () => {
    const rule = DateRule.isSameHour({
      field,
      value: u("2025-06-01T10:05:00Z"),
    });
    expect(DateRule.validate(rule, "2025-06-01T11:00:00Z")).toBeFalsy();
  });

  test("isSameDay — true same UTC day; false otherwise", () => {
    const yes = DateRule.isSameDay({
      field,
      value: u("2025-06-01T00:00:00Z"),
    });
    expect(DateRule.validate(yes, "2025-06-01T23:59:59Z")).toBeTruthy();

    const no = DateRule.isSameDay({
      field,
      value: u("2025-06-01T00:00:00Z"),
    });
    expect(DateRule.validate(no, "2025-06-02T00:00:00Z")).toBeFalsy();
  });

  test("isSameWeek (ISO, Monday start) — cross‑year boundary true", () => {
    // Both are ISO week 53 of 2020: Thu 2020-12-31 and Fri 2021-01-01
    const rule = DateRule.isSameWeek({
      field,
      value: u("2020-12-31T12:00:00Z"),
    });
    expect(DateRule.validate(rule, "2021-01-01T09:00:00Z")).toBeTruthy();
  });

  test("isSameWeek (ISO) — Sunday vs next Monday is false", () => {
    // Sun 2021-01-03 is previous ISO week; Mon 2021-01-04 is new ISO week
    const rule = DateRule.isSameWeek({
      field,
      value: u("2021-01-03T12:00:00Z"),
    });
    expect(DateRule.validate(rule, "2021-01-04T00:00:00Z")).toBeFalsy();
  });

  test("isSameMonth — true / false", () => {
    const yes = DateRule.isSameMonth({
      field,
      value: u("2025-05-01T00:00:00Z"),
    });
    expect(DateRule.validate(yes, "2025-05-31T23:59:59Z")).toBeTruthy();

    const no = DateRule.isSameMonth({
      field,
      value: u("2025-05-01T00:00:00Z"),
    });
    expect(DateRule.validate(no, "2025-06-01T00:00:00Z")).toBeFalsy();
  });

  test("isSameYear — true / false", () => {
    const yes = DateRule.isSameYear({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(yes, "2025-12-31T23:59:59Z")).toBeTruthy();

    const no = DateRule.isSameYear({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(no, "2026-01-01T00:00:00Z")).toBeFalsy();
  });

  // ──────────────────────────────────────────────────────────────
  // between (exclusive by default) & inclusive
  // ──────────────────────────────────────────────────────────────
  test("between (exclusive default) — inside is true, boundaries are false", () => {
    const rule = DateRule.between({
      field,
      value: {
        start: u("2025-01-01T00:00:00Z"),
        end: u("2025-01-31T23:59:59Z"),
      },
    });

    // strictly inside
    expect(DateRule.validate(rule, "2025-01-15T12:00:00Z")).toBeTruthy();

    // equal to boundaries → false
    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeFalsy();
    expect(DateRule.validate(rule, "2025-01-31T23:59:59Z")).toBeFalsy();
  });

  test("between (inclusive) — includes min/max", () => {
    const rule = DateRule.between({
      field,
      value: {
        start: u("2025-01-01T00:00:00Z"),
        end: u("2025-01-31T23:59:59Z"),
      },
      inclusive: true,
    });

    expect(DateRule.validate(rule, "2025-01-01T00:00:00Z")).toBeTruthy();
    expect(DateRule.validate(rule, "2025-01-31T23:59:59Z")).toBeTruthy();
    expect(DateRule.validate(rule, "2025-01-15T00:00:00Z")).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────
  // Decoder breadth: number, Date, DateTime.Utc
  // ──────────────────────────────────────────────────────────────
  test("decoder — value as epoch millis (number)", () => {
    const rule = DateRule.eq({
      field,
      value: u("2025-03-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, ms("2025-03-01T00:00:00Z"))).toBeTruthy();
  });

  test("decoder — value as Date object", () => {
    const rule = DateRule.eq({
      field,
      value: u("2025-04-01T00:00:00Z"),
    });
    expect(
      DateRule.validate(rule, new Date("2025-04-01T00:00:00Z")),
    ).toBeTruthy();
  });

  test("decoder — value as DateTime.Utc", () => {
    const rule = DateRule.eq({
      field,
      value: u("2025-05-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, u("2025-05-01T00:00:00Z"))).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────
  // Invalids / fallbacks
  // ──────────────────────────────────────────────────────────────
  test("invalid input decode → false", () => {
    const rule = DateRule.eq({
      field,
      value: u("2025-01-01T00:00:00Z"),
    });
    expect(DateRule.validate(rule, "not-a-date")).toBeFalsy();
  });

  test("invalid operator tag falls back to false", () => {
    const bogus = {
      field,
      op: { _tag: "not_real", value: u("2025-01-01T00:00:00Z") } as any,
    } as DateRule.Rule.Type;
    expect(DateRule.validate(bogus, "2025-01-01T00:00:00Z")).toBeFalsy();
  });
});
