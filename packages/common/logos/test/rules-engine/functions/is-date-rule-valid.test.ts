import { DateRule } from "@beep/logos";
import { describe, expect, test } from "vitest";

const d = (s: string) => s; // helper to keep literals concise; BS accepts ISO strings

describe("DateRule.validate", () => {
  // isBefore
  test("date is before comparison", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBefore" },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2020-12-31T00:00:00Z"));
    expect(result).toBeTruthy();
  });

  test("date equal to comparison is NOT before (strict)", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBefore" },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2021-01-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  // isAfter
  test("date is after comparison", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isAfter" },
      type: "date",
      value: { _tag: "comparison", value: d("2022-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-02T00:00:00Z"));
    expect(result).toBeTruthy();
  });

  test("date equal to comparison is NOT after (strict)", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isAfter" },
      type: "date",
      value: { _tag: "comparison", value: d("2022-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  // isBetween
  test("date is between range (inside)", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2022-01-01T00:00:00Z"),
        end: d("2022-01-31T23:59:59Z"),
      },
    };
    const result = DateRule.validate(rule, d("2022-01-15T12:00:00Z"));
    expect(result).toBeTruthy();
  });

  test("date equals start is between (inclusive)", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2022-01-01T00:00:00Z"),
        end: d("2022-01-31T23:59:59Z"),
      },
    };
    const result = DateRule.validate(rule, d("2022-01-01T00:00:00Z"));
    expect(result).toBeTruthy();
  });

  test("date equals end is between (inclusive)", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2022-01-01T00:00:00Z"),
        end: d("2022-01-31T23:59:59Z"),
      },
    };
    const result = DateRule.validate(rule, d("2022-01-31T23:59:59Z"));
    expect(result).toBeTruthy();
  });

  test("date before start is NOT between", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2022-01-01T00:00:00Z"),
        end: d("2022-01-31T23:59:59Z"),
      },
    };
    const result = DateRule.validate(rule, d("2021-12-31T23:59:59Z"));
    expect(result).toBeFalsy();
  });

  test("date after end is NOT between", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2022-01-01T00:00:00Z"),
        end: d("2022-01-31T23:59:59Z"),
      },
    };
    const result = DateRule.validate(rule, d("2022-02-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  // invalid operator
  test("invalid operator is handled", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      // @ts-expect-error
      op: { _tag: "is_more_awesome_than" },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2020-12-31T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  // wrong value shape for operator
  test("isBefore with range value yields false", () => {
    const rule: DateRule.Input = {
      field: "createdAt",
      op: { _tag: "isBefore" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2021-01-01T00:00:00Z"),
        end: d("2021-12-31T23:59:59Z"),
      },
    } as any;
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  test("isBetween with comparison value yields false", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    } as any;
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  // invalid decodes
  test("invalid main date decodes to false", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isAfter" },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, "not-a-date");
    expect(result).toBeFalsy();
  });

  test("invalid comparison decodes to false", () => {
    const rule: DateRule.Input = {
      field: "createdAt",
      op: { _tag: "isAfter" },
      type: "date",
      value: { _tag: "comparison", value: "not-a-date" as any },
    };
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  test("invalid range start decodes to false", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: "not-a-date" as any,
        end: d("2021-12-31T23:59:59Z"),
      },
    };
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  test("invalid range end decodes to false", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: { _tag: "isBetween" },
      type: "date",
      value: {
        _tag: "range",
        start: d("2021-01-01T00:00:00Z"),
        end: "not-a-date" as any,
      },
    };
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });
});
