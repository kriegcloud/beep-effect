import { HasEntryRule } from "@beep/logos/v2/rules";
import { describe, expect, test } from "vitest";

const kv = (key: string, value: any) => ({ key, value });

describe("HasEntryRule.validate", () => {
  test("contains — exact KV present (scalar)", () => {
    const rule = HasEntryRule.contains({
      field: "obj",
      value: kv("name", "alice"),
    });

    const value = { name: "alice", age: 30 };
    const result = HasEntryRule.validate(rule, value);
    expect(result).toBeTruthy();
  });

  test("contains — deep equality on nested JSON (object / array)", () => {
    const nested = {
      tags: ["x", "y"],
      meta: { ok: true, nums: [1, 2, { z: 3 }] },
    };
    // structurally equal, new reference:
    const selection = {
      tags: ["x", "y"],
      meta: { ok: true, nums: [1, 2, { z: 3 }] },
    };

    const rule = HasEntryRule.contains({
      field: "obj",
      value: kv("profile", selection),
    });

    const value = { profile: nested, name: "alice" };
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("notContains — same key, different value", () => {
    const rule = HasEntryRule.notContains({
      field: "obj",
      value: kv("name", "bob"),
    });

    const value = { name: "alice" };
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("inSet — at least one overlap among several", () => {
    const rule = HasEntryRule.inSet({
      field: "obj",
      value: [kv("missing", 1), kv("name", "alice"), kv("another", "nope")],
    });

    const value = { name: "alice", age: 30 };
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("inSet — no overlap", () => {
    const rule = HasEntryRule.inSet({
      field: "obj",
      value: [kv("x", 1), kv("y", 2)],
    });

    const value = { name: "alice" };
    expect(HasEntryRule.validate(rule, value)).toBe(false);
  });

  test("oneOf — exactly one DISTINCT overlap (duplicates in selection ignored)", () => {
    const rule = HasEntryRule.oneOf({
      field: "obj",
      value: [
        kv("name", "alice"),
        kv("name", "alice"), // duplicate on purpose
        kv("missing", 1),
      ],
    });

    const value = { name: "alice", age: 30 };
    // Only one distinct KV ("name":"alice") overlaps → true
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("oneOf — zero overlaps", () => {
    const rule = HasEntryRule.oneOf({
      field: "obj",
      value: [kv("x", 1), kv("y", 2)],
    });

    const value = { name: "alice" };
    expect(HasEntryRule.validate(rule, value)).toBe(false);
  });

  test("oneOf — two DISTINCT overlaps (fails)", () => {
    const rule = HasEntryRule.oneOf({
      field: "obj",
      value: [kv("name", "alice"), kv("age", 30)],
    });

    const value = { name: "alice", age: 30 };
    expect(HasEntryRule.validate(rule, value)).toBe(false);
  });

  test("noneOf — vacuously true on empty selection", () => {
    const rule = HasEntryRule.noneOf({
      field: "obj",
      value: [],
    });

    const value = { name: "alice" };
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("noneOf — at least one present (fails)", () => {
    const rule = HasEntryRule.noneOf({
      field: "obj",
      value: [kv("name", "alice"), kv("x", 1)],
    });
    const value = { name: "alice" };
    expect(HasEntryRule.validate(rule, value)).toBe(false);
  });

  test("allOf — success when every (distinct) selection KV appears", () => {
    const rule = HasEntryRule.allOf({
      field: "obj",
      value: [kv("name", "alice"), kv("age", 30)],
    });

    const value = { name: "alice", age: 30, extra: true };
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("allOf — fails when any KV missing", () => {
    const rule = HasEntryRule.allOf({
      field: "obj",
      value: [kv("name", "alice"), kv("age", 30), kv("country", "US")],
    });

    const value = { name: "alice", age: 30 };
    expect(HasEntryRule.validate(rule, value)).toBe(false);
  });

  test("contains — handles empty-string key", () => {
    const rule = HasEntryRule.contains({
      field: "obj",
      value: kv("", "empty"),
    });

    const value = { "": "empty" };
    expect(HasEntryRule.validate(rule, value)).toBe(true);
  });

  test("contains — false on empty record", () => {
    const rule = HasEntryRule.contains({
      field: "obj",
      value: kv("name", "alice"),
    });

    const value = {};
    expect(HasEntryRule.validate(rule, value)).toBe(false);
  });

  test("invalid operator falls back to false", () => {
    const rule: HasEntryRule.Input.Type = {
      field: "obj",
      op: {
        // @ts-expect-error – deliberately invalid
        _tag: "is_more_awesome_than",
        value: kv("name", "alice"),
      },
    };

    const value = { name: "alice" };
    expect(HasEntryRule.validate(rule as any, value)).toBe(false);
  });
});
