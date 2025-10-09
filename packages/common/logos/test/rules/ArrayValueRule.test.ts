import { describe, expect, test } from "bun:test";
import { ArrayValueRule } from "../../src/v2/rules";

describe("ArrayValueRule.validate", () => {
  const red = { id: 1, label: "red", meta: { tags: ["primary", { k: 1 }] } };
  // Structurally equal but different reference
  const redClone = {
    id: 1,
    label: "red",
    meta: { tags: ["primary", { k: 1 }] },
  };

  test("contains — primitive element present", () => {
    const rule = ArrayValueRule.contains({
      field: "colors",
      value: "red",
    });
    const result = ArrayValueRule.validate(rule, ["blue", "red", "green"]);
    expect(result).toBeTruthy();
  });

  test("contains — nested array element present (deep equality)", () => {
    const rule = ArrayValueRule.contains({
      field: "values",
      value: ["a", 1, { x: 2 }],
    });
    const result = ArrayValueRule.validate(rule, [["a", 1, { x: 2 }], ["b"]]);
    expect(result).toBeTruthy();
  });

  test("contains — deep object present (structural equality, not reference)", () => {
    const rule = ArrayValueRule.contains({
      field: "colors",
      value: redClone,
    });
    const result = ArrayValueRule.validate(rule, [red, { id: 2 }]);
    expect(result).toBeTruthy();
  });

  test("contains — element absent", () => {
    const rule = ArrayValueRule.contains({
      field: "colors",
      value: "purple",
    });
    const result = ArrayValueRule.validate(rule, ["red", "blue"]);
    expect(result).toBeFalsy();
  });

  test("notContains — element absent (true)", () => {
    const rule = ArrayValueRule.notContains({
      field: "colors",
      value: "purple",
    });
    const result = ArrayValueRule.validate(rule, ["red", "blue"]);
    expect(result).toBeTruthy();
  });

  test("notContains — element present (false)", () => {
    const rule = ArrayValueRule.notContains({
      field: "colors",
      value: "red",
    });
    const result = ArrayValueRule.validate(rule, ["red", "blue"]);
    expect(result).toBeFalsy();
  });

  test("inSet — at least one element overlaps (primitive)", () => {
    const rule = ArrayValueRule.inSet({
      field: "tags",
      value: ["x", "y", "z"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["a", "y", "b"]);
    expect(result).toBeTruthy();
  });

  test("inSet — none overlaps", () => {
    const rule = ArrayValueRule.inSet({
      field: "tags",
      value: ["x", "y"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["a", "b"]);
    expect(result).toBeFalsy();
  });

  test("oneOf — exactly one DISTINCT overlap (duplicates in input don't change count)", () => {
    const rule = ArrayValueRule.oneOf({
      field: "tags",
      value: ["x", "y", "z"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["y", "y", "a"]);
    expect(result).toBeTruthy();
  });

  test("oneOf — zero overlaps (false)", () => {
    const rule = ArrayValueRule.oneOf({
      field: "tags",
      value: ["x", "y"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["a", "b"]);
    expect(result).toBeFalsy();
  });

  test("oneOf — more than one DISTINCT overlap (false)", () => {
    const rule = ArrayValueRule.oneOf({
      field: "tags",
      value: ["x", "y", "z"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["y", "x", "a"]);
    expect(result).toBeFalsy();
  });

  test("allOf — all present (primitives)", () => {
    const rule = ArrayValueRule.allOf({
      field: "tags",
      value: ["x", "y"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["y", "x", "z"]);
    expect(result).toBeTruthy();
  });

  test("allOf — all present (deep objects)", () => {
    const one = { id: 1, nested: { a: [1, 2] } };
    const two = { id: 2, nested: { a: [3, { b: true }] } };
    const rule = ArrayValueRule.allOf({
      field: "objs",
      value: [{ ...one }, { ...two }],
    });
    const arr = [two, { id: 3 }, one];
    const result = ArrayValueRule.validate(rule, arr);
    expect(result).toBeTruthy();
  });

  test("allOf — missing at least one (false)", () => {
    const rule = ArrayValueRule.allOf({
      field: "tags",
      value: ["x", "y", "z"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["y", "x"]);
    expect(result).toBeFalsy();
  });

  test("noneOf — none present (true)", () => {
    const rule = ArrayValueRule.noneOf({
      field: "tags",
      value: ["x", "y"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["a", "b"]);
    expect(result).toBeTruthy();
  });

  test("noneOf — at least one present (false)", () => {
    const rule = ArrayValueRule.noneOf({
      field: "tags",
      value: ["x", "y"] as const,
    });
    const result = ArrayValueRule.validate(rule, ["y", "a"]);
    expect(result).toBeFalsy();
  });

  test("non-array input yields false", () => {
    const rule = ArrayValueRule.contains({
      field: "tags",
      value: "x",
    });
    // @ts-expect-error
    const result = ArrayValueRule.validate(rule, { not: "an array" });
    expect(result).toBeFalsy();
  });

  test("allOf — duplicates in op.value don't require duplicates in the array (set semantics)", () => {
    const rule = ArrayValueRule.allOf({
      field: "tags",
      value: ["x", "x"],
    });
    const result = ArrayValueRule.validate(rule, ["x"]);
    expect(result).toBeTruthy();
  });
});
