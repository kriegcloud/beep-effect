import { HasKeyRule } from "@beep/logos/v2/rules";
import { describe, expect, test } from "vitest";

describe("HasKeyRule.validate (v2)", () => {
  // typical input object (note: includes an empty-string key which JSON allows)
  const obj = {
    name: "alice",
    age: 30,
    "": "empty",
    nested: { a: 1 },
  };

  test("contains — key present", () => {
    const rule = HasKeyRule.contains({
      field: "object",
      value: "name",
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("contains — empty-string key present", () => {
    const rule = HasKeyRule.contains({
      field: "object",
      value: "",
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("contains — key absent", () => {
    const rule = HasKeyRule.contains({
      field: "object",
      value: "height",
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("notContains — key absent (true)", () => {
    const rule = HasKeyRule.notContains({
      field: "object",
      value: "height",
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("notContains — key present (false)", () => {
    const rule = HasKeyRule.notContains({
      field: "object",
      value: "name",
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("inSet — at least one overlap (true)", () => {
    const rule = HasKeyRule.inSet({
      field: "object",
      value: ["height", "name"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("inSet — none overlaps (false)", () => {
    const rule = HasKeyRule.inSet({
      field: "object",
      value: ["height", "weight"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("oneOf — exactly one DISTINCT overlap (true)", () => {
    // Only "age" exists; "status" and "height" don't
    const rule = HasKeyRule.oneOf({
      field: "object",
      value: ["status", "age", "height"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("oneOf — zero overlaps (false)", () => {
    const rule = HasKeyRule.oneOf({
      field: "object",
      value: ["status", "height"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("oneOf — more than one DISTINCT overlap (false)", () => {
    // Both "name" and "age" exist → 2 distinct overlaps
    const rule = HasKeyRule.oneOf({
      field: "object",
      value: ["name", "age", "status"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("allOf — all keys present (true)", () => {
    const rule = HasKeyRule.allOf({
      field: "object",
      value: ["name", "age"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("allOf — missing at least one key (false)", () => {
    const rule = HasKeyRule.allOf({
      field: "object",
      value: ["name", "age", "status"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("noneOf — none present (true)", () => {
    const rule = HasKeyRule.noneOf({
      field: "object",
      value: ["status", "height"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("noneOf — at least one present (false)", () => {
    const rule = HasKeyRule.noneOf({
      field: "object",
      value: ["status", "name"],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeFalsy();
  });

  test("noneOf — empty selection is vacuously true", () => {
    const rule = HasKeyRule.noneOf({
      field: "object",
      value: [],
    });
    const result = HasKeyRule.validate(rule, obj);
    expect(result).toBeTruthy();
  });

  test("non-object input yields false", () => {
    const rule = HasKeyRule.contains({
      field: "object",
      value: "name",
    });
    // @ts-expect-error - deliberate invalid input
    const result = HasKeyRule.validate(rule, "not-an-object");
    expect(result).toBeFalsy();
  });

});
