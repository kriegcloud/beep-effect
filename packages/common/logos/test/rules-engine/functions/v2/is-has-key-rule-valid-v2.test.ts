import { HasKeyRule } from "@beep/logos/v2/rules";
import { describe, expect, test } from "vitest";

describe("HasKeyRule.validate (v2)", () => {
  // typical input object (note: includes an empty-string key which JSON allows)
  const obj: Readonly<Record<string, any>> = {
    name: "alice",
    age: 30,
    "": "empty",
    nested: { a: 1 },
  };

  test("contains — key present", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "contains", value: "name" },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("contains — empty-string key present", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "contains", value: "" },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("contains — key absent", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "contains", value: "height" },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("notContains — key absent (true)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "notContains", value: "height" },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("notContains — key present (false)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "notContains", value: "name" },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("inSet — at least one overlap (true)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "inSet", value: ["height", "name"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("inSet — none overlaps (false)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "inSet", value: ["height", "weight"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("oneOf — exactly one DISTINCT overlap (true)", () => {
    // Only "age" exists; "status" and "height" don't
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "oneOf", value: ["status", "age", "height"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("oneOf — zero overlaps (false)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "oneOf", value: ["status", "height"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("oneOf — more than one DISTINCT overlap (false)", () => {
    // Both "name" and "age" exist → 2 distinct overlaps
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "oneOf", value: ["name", "age", "status"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("allOf — all keys present (true)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "allOf", value: ["name", "age"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("allOf — missing at least one key (false)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "allOf", value: ["name", "age", "status"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("noneOf — none present (true)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "noneOf", value: ["status", "height"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("noneOf — at least one present (false)", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "noneOf", value: ["status", "name"] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("noneOf — empty selection is vacuously true", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "noneOf", value: [] },
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("non-object input yields false", () => {
    const rule = HasKeyRule.make({
      field: "object",
      op: { _tag: "contains", value: "name" },
    });
    // @ts-expect-error - deliberate invalid input
    const result = HasKeyRule.validate(rule, "not-an-object");
    expect(result).toBeFalsy();
  });

  test("invalid operator is handled", () => {
    const rule: HasKeyRule.Input.Type = {
      field: "object",
      // @ts-expect-error - deliberate invalid operator tag
      op: { _tag: "is_more_awesome_than", value: "name" },
      type: "hasKey",
    };
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });
});
