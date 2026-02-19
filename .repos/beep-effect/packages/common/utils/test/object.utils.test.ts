import { describe, expect, test } from "bun:test";
import { cloneDeep, defaultsDeep, mergeDefined, omit, omitBy } from "@beep/utils/data/object.utils";
import * as P from "effect/Predicate";

describe("cloneDeep", () => {
  test("clones primitive values", () => {
    expect(cloneDeep(42)).toBe(42);
    expect(cloneDeep("hello")).toBe("hello");
    expect(cloneDeep(true)).toBe(true);
    expect(cloneDeep(null)).toBe(null);
    expect(cloneDeep(undefined)).toBe(undefined);
  });

  test("clones simple objects", () => {
    const original = { a: 1, b: "test", c: true };
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  test("clones nested objects", () => {
    const original = { a: { b: { c: 1 } } };
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned.a).not.toBe(original.a);
    expect(cloned.a.b).not.toBe(original.a.b);
  });

  test("clones arrays", () => {
    const original = [1, 2, [3, 4]];
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[2]).not.toBe(original[2]);
  });

  test("clones Date objects", () => {
    const original = new Date("2024-01-01");
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.getTime()).toBe(original.getTime());
  });

  test("clones RegExp objects", () => {
    const original = /test/gi;
    const cloned = cloneDeep(original);

    expect(cloned.source).toBe(original.source);
    expect(cloned.flags).toBe(original.flags);
    expect(cloned).not.toBe(original);
  });

  test("clones Map objects", () => {
    const original = new Map<string, unknown>([
      ["a", 1],
      ["b", { nested: true }],
    ]);
    const cloned = cloneDeep(original);

    expect(cloned.get("a")).toBe(1);
    expect(cloned.get("b")).toEqual({ nested: true });
    expect(cloned.get("b")).not.toBe(original.get("b"));
    expect(cloned).not.toBe(original);
  });

  test("clones Set objects", () => {
    const nestedObj = { id: 1 };
    const original = new Set([1, 2, nestedObj]);
    const cloned = cloneDeep(original);

    expect(cloned.size).toBe(3);
    expect(cloned.has(1)).toBe(true);
    expect(cloned.has(2)).toBe(true);
    expect(cloned).not.toBe(original);
  });

  test("handles circular references", () => {
    const original: Record<string, unknown> = { a: 1 };
    original["self" as const] = original;

    const cloned = cloneDeep(original);

    expect(cloned.a).toBe(1);
    expect(cloned["self" as const]).toBe(cloned);
    expect(cloned).not.toBe(original);
  });

  test("clones complex nested structures", () => {
    const original = {
      users: [{ name: "John", settings: { theme: "dark" } }],
      metadata: { created: new Date("2024-01-01") },
    };
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned.users[0]).not.toBe(original.users[0]);
    expect(cloned.users[0]?.settings).not.toBe(original.users[0]?.settings);
    expect(cloned.metadata.created).not.toBe(original.metadata.created);
  });
});

describe("defaultsDeep", () => {
  test("assigns default values for undefined properties", () => {
    const target = { a: 1 } as Record<string, unknown>;
    const source = { a: 2, b: 3 };
    const result = defaultsDeep(target, source);

    expect(result.a).toBe(1);
    expect(result.b).toBe(3);
  });

  test("deeply assigns default values", () => {
    const target = { theme: { mode: "light" } } as Record<string, unknown>;
    const source = { theme: { mode: "dark", accent: "blue" } };
    const result = defaultsDeep(target, source);

    expect(result).toEqual({ theme: { mode: "light", accent: "blue" } });
  });

  test("handles multiple sources", () => {
    const target = { a: 1 } as Record<string, unknown>;
    const result = defaultsDeep(target, { b: 2 }, { c: 3 });

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  test("does not overwrite existing values with undefined", () => {
    const target = { a: 1 } as Record<string, unknown>;
    const result = defaultsDeep(target, { a: undefined, b: 2 });

    expect(result.a).toBe(1);
    expect(result.b).toBe(2);
  });

  test("clones arrays from sources", () => {
    const source = { items: [1, 2, 3] };
    const result = defaultsDeep({} as Record<string, unknown>, source);

    expect(result.items).toEqual([1, 2, 3]);
    expect(result.items).not.toBe(source.items);
  });

  test("preserves target arrays over source arrays", () => {
    const result = defaultsDeep({ items: [1, 2] } as Record<string, unknown>, { items: [3, 4, 5] });

    expect(result.items).toEqual([1, 2]);
  });

  test("ignores unsafe properties", () => {
    const result = defaultsDeep({} as Record<string, unknown>, { __proto__: { malicious: true }, safe: 1 });

    expect(result.safe).toBe(1);
    expect(result["malicious" as const]).toBeUndefined();
  });

  test("handles empty target", () => {
    const result = defaultsDeep({} as Record<string, unknown>, { a: { b: 1 } });

    expect(result).toEqual({ a: { b: 1 } });
  });
});

describe("omit", () => {
  test("omits specified keys", () => {
    const result = omit({ a: 1, b: 2, c: 3 }, "b", "c");

    expect(result).toEqual({ a: 1 });
  });

  test("returns same shape when no keys to omit", () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("handles single key omission", () => {
    const result = omit({ password: "secret", name: "John" }, "password");

    expect(result).toEqual({ name: "John" });
  });

  test("handles non-existent keys gracefully", () => {
    const result = omit({ a: 1 } as { a: number; b?: number }, "b");

    expect(result).toEqual({ a: 1 });
  });

  test("preserves other properties", () => {
    const user = { id: 1, name: "John", email: "john@test.com", password: "secret" };
    const result = omit(user, "password");

    expect(result).toEqual({ id: 1, name: "John", email: "john@test.com" });
  });
});

describe("omitBy", () => {
  test("omits properties matching predicate", () => {
    const result = omitBy({ a: 1, b: null, c: "hello" }, P.isNull);

    expect(result).toEqual({ a: 1, c: "hello" });
  });

  test("omits nullable values", () => {
    const result = omitBy({ a: 1, b: null, c: undefined, d: "test" }, P.isNullable);

    expect(result).toEqual({ a: 1, d: "test" });
  });

  test("omits based on custom predicate", () => {
    const result = omitBy({ a: 1, b: 2, c: 3, d: 4 }, (value) => typeof value === "number" && value > 2);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("predicate receives key as second argument", () => {
    const result = omitBy({ keep: 1, remove_me: 2, also_keep: 3 }, (_, key) => String(key).startsWith("remove"));

    expect(result).toEqual({ keep: 1, also_keep: 3 });
  });

  test("returns empty object when all properties match predicate", () => {
    const result = omitBy({ a: null, b: null }, P.isNull);

    expect(result).toEqual({});
  });

  test("returns all properties when no properties match predicate", () => {
    const result = omitBy({ a: 1, b: 2 }, P.isNull);

    expect(result).toEqual({ a: 1, b: 2 });
  });
});

describe("mergeDefined", () => {
  test("prefers defined values from source1", () => {
    const source1 = { a: 1, b: undefined as number | undefined };
    const source2 = { a: 2, b: 3 };
    const result = mergeDefined(source1, source2);

    expect((result as Record<string, unknown>).a).toBe(1);
    expect((result as Record<string, unknown>).b).toBe(3);
  });

  test("merges objects from both sources", () => {
    const result = mergeDefined({ a: 1 } as Record<string, unknown>, { b: 2 } as Record<string, unknown>);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("handles omitNull option", () => {
    const source1 = { a: null, b: 1 } as Record<string, unknown>;
    const source2 = { a: 2 } as Record<string, unknown>;
    const result = mergeDefined(source1, source2, { omitNull: true });

    // With omitNull: true, null is kept (only undefined triggers fallback)
    expect(result.a).toBe(null);
  });

  test("handles mergeArrays option", () => {
    const result = mergeDefined({ items: [1, 2] }, { items: [3, 4] }, { mergeArrays: true });

    expect(result.items).toEqual([1, 2, 3, 4]);
  });

  test("replaces arrays by default", () => {
    const result = mergeDefined({ items: [1, 2] }, { items: [3, 4] });

    expect(result.items).toEqual([3, 4]);
  });

  test("deeply merges nested objects", () => {
    const source1 = { user: { name: "John", age: undefined as number | undefined } };
    const source2 = { user: { name: "Jane", age: 30 } };
    const result = mergeDefined(source1, source2);

    expect((result as Record<string, unknown>).user).toEqual({ name: "John", age: 30 });
  });

  test("omits undefined values from result", () => {
    const source1 = { a: 1, b: undefined } as Record<string, unknown>;
    const source2 = { c: undefined } as Record<string, unknown>;
    const result = mergeDefined(source1, source2);

    expect(result.a).toBe(1);
    expect("b" in result).toBe(false);
    expect("c" in result).toBe(false);
  });

  test("ignores unsafe properties", () => {
    const result = mergeDefined(
      {} as Record<string, unknown>,
      { __proto__: { malicious: true }, safe: 1 } as Record<string, unknown>
    );

    expect(result).toEqual({ safe: 1 });
  });
});
