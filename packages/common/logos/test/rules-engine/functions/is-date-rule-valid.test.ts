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

  // isBetween (new operator config)
  test("date is between (inside) using operator config", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: true,
      },
      type: "date",
      // value is ignored for isBetween when operator has config
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-15T12:00:00Z"));
    expect(result).toBeTruthy();
  });

  test("date equals start is between when inclusive=true", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: true,
      },
      type: "date",
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-01T00:00:00Z"));
    expect(result).toBeTruthy();
  });

  test("date equals end is between when inclusive=true", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: true,
      },
      type: "date",
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-31T23:59:59Z"));
    expect(result).toBeTruthy();
  });

  test("inclusive=false excludes exact start boundary", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: false,
      },
      type: "date",
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  test("inclusive=false excludes exact end boundary", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: false,
      },
      type: "date",
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2022-01-31T23:59:59Z"));
    expect(result).toBeFalsy();
  });

  test("date before start is NOT between with operator config", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: true,
      },
      type: "date",
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2021-12-31T23:59:59Z"));
    expect(result).toBeFalsy();
  });

  test("date after end is NOT between with operator config", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2022-01-01T00:00:00Z"),
        maximum: d("2022-01-31T23:59:59Z"),
        inclusive: true,
      },
      type: "date",
      value: { _tag: "comparison", value: d("1900-01-01T00:00:00Z") },
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

  test("isBetween with comparison value yields false (legacy path without operator config)", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      // Intentionally omit config (legacy persisted rules)
      op: { _tag: "isBetween" } as any,
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

  test("invalid operator minimum decodes to false", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: "not-a-date" as any,
        maximum: d("2021-12-31T23:59:59Z"),
        inclusive: true,
      },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });

  test("invalid operator maximum decodes to false", () => {
    const rule: DateRule.InputEncoded = {
      field: "createdAt",
      op: {
        _tag: "isBetween",
        minimum: d("2021-01-01T00:00:00Z"),
        maximum: "not-a-date" as any,
        inclusive: true,
      },
      type: "date",
      value: { _tag: "comparison", value: d("2021-01-01T00:00:00Z") },
    };
    const result = DateRule.validate(rule, d("2021-06-01T00:00:00Z"));
    expect(result).toBeFalsy();
  });
});
