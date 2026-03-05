import { Struct } from "@beep/utils";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import { describe, expect, expectTypeOf, it } from "vitest";

describe("@beep/utils Struct.dotGet", () => {
  it("supports data-first and data-last calls", () => {
    const source = { attributes: { name: "beep" }, kind: "example" } as const;

    const dataFirst = Struct.dotGet(source, "attributes.name");
    const dataLast = pipe(source, Struct.dotGet("attributes.name"));

    expect(dataFirst).toBe("beep");
    expect(dataLast).toBe("beep");
    expectTypeOf(dataFirst).toEqualTypeOf<"beep">();
    expectTypeOf(dataLast).toEqualTypeOf<"beep">();
  });

  it("supports top-level keys", () => {
    const source = { kind: "example" } as const;
    expect(Struct.dotGet(source, "kind")).toBe("example");
  });

  it("supports tuple paths", () => {
    const source = { "attributes.name": "flat", attributes: { name: "nested" } } as const;
    const dataFirst = Struct.dotGet(source, ["attributes", "name"] as const);
    const dataLast = pipe(source, Struct.dotGet(["attributes.name"] as const));

    expect(dataFirst).toBe("nested");
    expect(dataLast).toBe("flat");
    expectTypeOf(dataFirst).toEqualTypeOf<"nested">();
    expectTypeOf(dataLast).toEqualTypeOf<"flat">();
  });

  it("returns undefined when runtime data does not satisfy the path", () => {
    const runtimeMismatch = { attributes: {} } as unknown as { attributes: { name: string } };
    expect(Struct.dotGet(runtimeMismatch, "attributes.name")).toBeUndefined();
  });

  it("supports nested access through optional properties", () => {
    const withAttributes: { attributes?: { name: string } } = { attributes: { name: "beep" } };
    const withoutAttributes: { attributes?: { name: string } } = {};

    const maybeNameA = Struct.dotGet(withAttributes, "attributes.name");
    const maybeNameB = Struct.dotGet(withoutAttributes, "attributes.name");

    expectTypeOf(maybeNameA).toEqualTypeOf<string | undefined>();
    expectTypeOf(maybeNameB).toEqualTypeOf<string | undefined>();
    expect(maybeNameA).toBe("beep");
    expect(maybeNameB).toBeUndefined();
  });

  it("accesses tuple elements via numeric string paths", () => {
    const source = { tags: ["a", "b", "c"], items: [{ name: "x" }] } as const;

    expect(Struct.dotGet(source, "tags.0")).toBe("a");
    expect(Struct.dotGet(source, "tags.2")).toBe("c");
    expect(Struct.dotGet(source, "items.0")).toEqual({ name: "x" });
    expect(Struct.dotGet(source, "items.0.name")).toBe("x");
  });

  it("accesses regular array elements via numeric string paths", () => {
    const source = { values: [10, 20, 30] };

    expect(Struct.dotGet(source, "values.0")).toBe(10);
    expect(Struct.dotGet(source, "values.2")).toBe(30);
  });

  it("returns undefined for out-of-bounds array access", () => {
    const source = { tags: ["a"] } as const;
    // @ts-expect-error
    expect(Struct.dotGet(source, "tags.5")).toBeUndefined();
  });

  it("returns Option values with path existence semantics", () => {
    const source = { attributes: { name: "beep" }, maybeUndefined: undefined as string | undefined } as const;
    const missing = { attributes: {} } as unknown as { attributes: { name: string } };

    const some = Struct.dotGetOption(source, "attributes.name");
    const someFromTuple = pipe(source, Struct.dotGetOption(["attributes", "name"] as const));
    const someUndefined = Struct.dotGetOption(source, "maybeUndefined");
    const none = Struct.dotGetOption(missing, "attributes.name");

    expect(O.isSome(some)).toBe(true);
    expect(O.isSome(someFromTuple)).toBe(true);
    expect(O.isSome(someUndefined)).toBe(true);
    expect(O.isNone(none)).toBe(true);
  });
});
// bench

describe("@beep/utils Struct.reverse", () => {
  it("reverses key/value mappings and preserves literals", () => {
    const ErrorEnum = {
      SUCCESSFUL_COMPLETION: "00000",
      WARNING: "01000",
    } as const;

    const reversed = Struct.reverse(ErrorEnum);
    const reversedFromPipe = pipe(ErrorEnum, Struct.reverse());

    expect(reversed[ErrorEnum.SUCCESSFUL_COMPLETION]).toBe("SUCCESSFUL_COMPLETION");
    expect(reversedFromPipe[ErrorEnum.SUCCESSFUL_COMPLETION]).toBe("SUCCESSFUL_COMPLETION");
    expect(ErrorEnum[reversed["00000"]]).toBe("00000");
    expectTypeOf(reversed["00000"]).toEqualTypeOf<"SUCCESSFUL_COMPLETION">();
    expectTypeOf(reversed["01000"]).toEqualTypeOf<"WARNING">();
    expectTypeOf(reversedFromPipe["00000"]).toEqualTypeOf<"SUCCESSFUL_COMPLETION">();
  });

  it("supports symbol keys", () => {
    const FOO = Symbol("FOO");
    const BAR = Symbol("BAR");
    const source = {
      [FOO]: "foo",
      [BAR]: "bar",
    } as const;

    const reversed = Struct.reverse(source);

    expect(reversed.foo).toBe(FOO);
    expect(reversed.bar).toBe(BAR);
    expectTypeOf(reversed.foo).toEqualTypeOf<typeof FOO>();
    expectTypeOf(reversed.bar).toEqualTypeOf<typeof BAR>();
  });

  it("models duplicate values as key unions", () => {
    const source = {
      FIRST: "X",
      SECOND: "X",
    } as const;

    const reversed = Struct.reverse(source);

    expect(reversed.X).toBe("SECOND");
    expectTypeOf(reversed.X).toEqualTypeOf<"FIRST" | "SECOND">();
  });
});

describe("@beep/utils Struct.pathsOf", () => {
  it("collects all dot-delimited paths from a struct", () => {
    const source = { a: { b: 1 }, c: "hello" } as const;
    const result = Struct.pathsOf(source);
    expect(result).toEqual(["a", "a.b", "c"]);
  });

  it("returns flat keys for a flat struct", () => {
    const source = { x: 1, y: 2 } as const;
    expect(Struct.pathsOf(source)).toEqual(["x", "y"]);
  });

  it("handles deeply nested structs", () => {
    const source = { a: { b: { c: 1 } } } as const;
    expect(Struct.pathsOf(source)).toEqual(["a", "a.b", "a.b.c"]);
  });
});

describe("@beep/utils Struct.entries", () => {
  it("returns key-value pairs for string keys", () => {
    const source = { a: "foo", b: 1 };
    const result = Struct.entries(source);
    expect(result).toEqual([
      ["a", "foo"],
      ["b", 1],
    ]);
  });

  it("excludes symbol keys", () => {
    const sym = Symbol("sym");
    const source = { a: "foo", [sym]: true };
    const result = Struct.entries(source);
    expect(result).toEqual([["a", "foo"]]);
  });
});

describe("@beep/utils Struct.keys", () => {
  it("returns string keys of an object", () => {
    const source = { a: "foo", b: 1, c: true };
    const result = Struct.keys(source);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("excludes symbol keys", () => {
    const sym = Symbol("sym");
    const source = { a: "foo", [sym]: true };
    const result = Struct.keys(source);
    expect(result).toEqual(["a"]);
  });
});

describe("@beep/utils Struct.fromEntries", () => {
  it("creates an object from entries", () => {
    const result = Struct.fromEntries([
      ["a", 1],
      ["b", "hello"],
    ] as const);
    expect(result).toEqual({ a: 1, b: "hello" });
  });

  it("roundtrips with entries", () => {
    const source = { x: 10, y: 20 };
    const result = Struct.fromEntries(Struct.entries(source));
    expect(result).toEqual(source);
  });

  it("last value wins for duplicate keys", () => {
    const result = Struct.fromEntries([
      ["a", 1],
      ["a", 2],
    ] as const);
    expect(result).toEqual({ a: 2 });
  });
});
