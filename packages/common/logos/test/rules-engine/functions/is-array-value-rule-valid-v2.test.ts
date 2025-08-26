import {ArrayValueRule} from "@beep/logos/v2/internal/Operand";
import {describe, expect, test} from "vitest";

describe("ArrayValueRule.validate", () => {
  const red = { id: 1, label: "red", meta: { tags: ["primary", { k: 1 }] } };
  // Structurally equal but different reference
  const redClone = { id: 1, label: "red", meta: { tags: ["primary", { k: 1 }] } };

  test("contains — primitive element present", () => {
    const rule = ArrayValueRule.Input.make({
      field: "colors",
      op: { _tag: "contains", value: "red" }
    });
    const result = ArrayValueRule.validate(rule, ["blue", "red", "green"]);
    expect(result).toBeTruthy();
  });

  test("contains — nested array element present (deep equality)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "values",
      op: { _tag: "contains", value: ["a", 1, { x: 2 }] }
    });
    const result = ArrayValueRule.validate(rule, [
      ["a", 1, { x: 2 }],
      ["b"]
    ]);
    expect(result).toBeTruthy();
  });

  test("contains — deep object present (structural equality, not reference)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "colors",
      op: { _tag: "contains", value: redClone }
    });
    const result = ArrayValueRule.validate(rule, [red, { id: 2 }]);
    expect(result).toBeTruthy();
  });

  test("contains — element absent", () => {
    const rule = ArrayValueRule.Input.make({
      field: "colors",
      op: { _tag: "contains", value: "purple" }
    });
    const result = ArrayValueRule.validate(rule, ["red", "blue"]);
    expect(result).toBeFalsy();
  });

  test("notContains — element absent (true)", () => {
    const rule: ArrayValueRule.Input = ArrayValueRule.Input.make({
      field: "colors",
      op: { _tag: "notContains", value: "purple" }
    });
    const result = ArrayValueRule.validate(rule, ["red", "blue"]);
    expect(result).toBeTruthy();
  });

  test("notContains — element present (false)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "colors",
      op: { _tag: "notContains", value: "red" }
    });
    const result = ArrayValueRule.validate(rule, ["red", "blue"]);
    expect(result).toBeFalsy();
  });

  test("inSet — at least one element overlaps (primitive)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "inSet", value: ["x", "y", "z"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["a", "y", "b"]);
    expect(result).toBeTruthy();
  });

  test("inSet — none overlaps", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "inSet", value: ["x", "y"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["a", "b"]);
    expect(result).toBeFalsy();
  });

  test("oneOf — exactly one DISTINCT overlap (duplicates in input don't change count)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "oneOf", value: ["x", "y", "z"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["y", "y", "a"]);
    expect(result).toBeTruthy();
  });

  test("oneOf — zero overlaps (false)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "oneOf", value: ["x", "y"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["a", "b"]);
    expect(result).toBeFalsy();
  });

  test("oneOf — more than one DISTINCT overlap (false)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      type: "arrayValue",
      op: { _tag: "oneOf", value: ["x", "y", "z"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["y", "x", "a"]);
    expect(result).toBeFalsy();
  });

  test("allOf — all present (primitives)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      type: "arrayValue",
      op: { _tag: "allOf", value: ["x", "y"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["y", "x", "z"]);
    expect(result).toBeTruthy();
  });

  test("allOf — all present (deep objects)", () => {
    const one = { id: 1, nested: { a: [1, 2] } };
    const two = { id: 2, nested: { a: [3, { b: true }] } };
    const rule = ArrayValueRule.Input.make({
      field: "objs",
      type: "arrayValue",
      op: { _tag: "allOf", value: [ { ...one }, { ...two } ] }
    });
    const arr = [two, { id: 3 }, one];
    const result = ArrayValueRule.validate(rule, arr);
    expect(result).toBeTruthy();
  });

  test("allOf — missing at least one (false)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      type: "arrayValue",
      op: { _tag: "allOf", value: ["x", "y", "z"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["y", "x"]);
    expect(result).toBeFalsy();
  });

  test("noneOf — none present (true)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      type: "arrayValue",
      op: { _tag: "noneOf", value: ["x", "y"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["a", "b"]);
    expect(result).toBeTruthy();
  });

  test("noneOf — at least one present (false)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "noneOf", value: ["x", "y"] as const }
    });
    const result = ArrayValueRule.validate(rule, ["y", "a"]);
    expect(result).toBeFalsy();
  });

  test("non-array input yields false", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "contains", value: "x" }
    });
    // @ts-expect-error
    const result = ArrayValueRule.validate(rule, { not: "an array" });
    expect(result).toBeFalsy();
  });

  test("invalid operator is handled", () => {
    const rule: ArrayValueRule.Input = {
      field: "tags",
      // @ts-expect-error
      op: { _tag: "is_more_awesome_than", value: "x" },
      type: "arrayValue"
    };
    const result = ArrayValueRule.validate(rule, ["x"]);
    expect(result).toBeFalsy();
  });

  test("allOf — duplicates in op.value don't require duplicates in the array (set semantics)", () => {
    const rule = ArrayValueRule.Input.make({
      field: "tags",
      op: { _tag: "allOf", value: ["x", "x"] }
    });
    const result = ArrayValueRule.validate(rule, ["x"]);
    expect(result).toBeTruthy();
  });
});
