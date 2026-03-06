import { type A, Struct } from "@beep/utils";
import { pipe } from "effect/Function";
import type * as O from "effect/Option";
import { describe, expect, it } from "tstyche";

describe("dotGet", () => {
  it("resolves nested path value types", () => {
    const source = { attributes: { name: "beep" as const }, kind: "example" as const } as const;

    expect(Struct.dotGet(source, "attributes.name")).type.toBe<"beep">();
    expect(Struct.dotGet(source, "kind")).type.toBe<"example">();
    expect(Struct.dotGet(source, ["attributes", "name"] as const)).type.toBe<"beep">();

    const getName = Struct.dotGet("attributes.name");
    expect(getName(source)).type.toBe<"beep">();

    const getNameFromTuple = Struct.dotGet(["attributes", "name"] as const);
    expect(getNameFromTuple(source)).type.toBe<"beep">();
  });

  it("resolves Option return types", () => {
    const source = { attributes: { name: "beep" as const } } as const;
    expect(Struct.dotGetOption(source, "attributes.name")).type.toBe<O.Option<"beep">>();
    expect(Struct.dotGetOption(source, ["attributes", "name"] as const)).type.toBe<O.Option<"beep">>();
  });

  it("rejects invalid string paths", () => {
    const source = { attributes: { name: "beep" } } as const;

    // @ts-expect-error not assignable to parameter of type
    Struct.dotGet(source, "attributes.missing");
  });

  it("accepts Record paths and returns unknown", () => {
    const record = {} as Record<string, unknown>;
    expect(Struct.dotGet(record, "anything")).type.toBe<unknown>();
  });

  it("accepts tuple paths without validation and returns unknown for invalid", () => {
    const source = { attributes: { name: "beep" } } as const;
    expect(Struct.dotGet(source, ["attributes", "missing"] as const)).type.toBe<unknown>();
  });

  it("resolves tuple element types via numeric string paths", () => {
    const source = { tags: ["a", "b", "c"] as const, items: [{ name: "x" }] as const } as const;

    expect(Struct.dotGet(source, "tags.0")).type.toBe<"a">();
    expect(Struct.dotGet(source, "items.0")).type.toBe<{ readonly name: "x" }>();
    expect(Struct.dotGet(source, "items.0.name")).type.toBe<"x">();
  });

  it("resolves array element types via number template paths", () => {
    const source = { values: [1, 2, 3] as number[] };

    expect(Struct.dotGet(source, `values.${0}`)).type.toBe<number | undefined>();
  });

  it("includes undefined in value types when a path crosses optional properties", () => {
    const maybeAttributes: { attributes?: { name: string } } = {};
    expect(Struct.dotGet(maybeAttributes, "attributes.name")).type.toBe<string | undefined>();
    expect(Struct.dotGetOption(maybeAttributes, "attributes.name")).type.toBe<O.Option<string | undefined>>();
  });
});
// bench

describe("mapPath", () => {
  it("resolves path values into function return types", () => {
    const source = { attributes: { name: "beep" as const }, count: 1 as const } as const;
    const renderLength = (value: string) => value.length;

    expect(Struct.mapPath(source, renderLength, "attributes.name")).type.toBe<number>();
    expect(Struct.mapPath(renderLength, "attributes.name")(source)).type.toBe<number>();
    expect(Struct.mapPath(source, (value: "beep") => value, ["attributes", "name"] as const)).type.toBe<"beep">();
    expect(Struct.mapPath(source, (value: 1) => value + 1, "count")).type.toBe<number>();
  });

  it("rejects incompatible function parameter types", () => {
    const source = { count: 1 } as const;

    // @ts-expect-error not assignable to parameter of type
    Struct.mapPath(source, (value: string) => value.length, "count");
    pipe(
      source,
      // @ts-expect-error not assignable to parameter of type
      Struct.mapPath((value: string) => value.length, "count")
    );
  });
});

describe("mapPathLazy", () => {
  it("returns typed thunks", () => {
    const source = { attributes: { name: "beep" as const }, count: 1 as const } as const;

    expect(Struct.mapPathLazy(source, (value: string) => value.length, "attributes.name")).type.toBe<() => number>();
    expect(Struct.mapPathLazy((value: "beep") => value, "attributes.name")(source)).type.toBe<() => "beep">();
    expect(Struct.mapPathLazy(source, (value: 1) => value + 1, "count")).type.toBe<() => number>();
    expect(Struct.mapPathLazy(source, (value: "beep") => value, ["attributes", "name"] as const)).type.toBe<
      () => "beep"
    >();
  });

  it("rejects incompatible function parameter types", () => {
    const source = { count: 1 } as const;

    // @ts-expect-error not assignable to parameter of type
    Struct.mapPathLazy(source, (value: string) => value.length, "count");
  });
});

describe("reverse", () => {
  it("supports data-first and data-last usage with preserved literals", () => {
    const ErrorEnum = {
      SUCCESSFUL_COMPLETION: "00000",
      WARNING: "01000",
    } as const;

    const dataFirst = Struct.reverse(ErrorEnum);
    const dataLast = pipe(ErrorEnum, Struct.reverse());

    expect(dataFirst).type.toBe<{
      readonly "00000": "SUCCESSFUL_COMPLETION";
      readonly "01000": "WARNING";
    }>();
    expect(dataLast).type.toBe<{
      readonly "00000": "SUCCESSFUL_COMPLETION";
      readonly "01000": "WARNING";
    }>();
  });

  it("supports symbol keys", () => {
    const FOO = Symbol("FOO");
    const BAR = Symbol("BAR");
    const source = {
      [FOO]: "foo",
      [BAR]: "bar",
    } as const;

    const reversed = Struct.reverse(source);

    expect(reversed.foo).type.toBe<typeof FOO>();
    expect(reversed.bar).type.toBe<typeof BAR>();
  });

  it("models duplicate values as key unions", () => {
    const source = {
      FIRST: "X",
      SECOND: "X",
    } as const;

    expect(Struct.reverse(source).X).type.toBe<"FIRST" | "SECOND">();
  });

  it("rejects non PropertyKey values", () => {
    const invalid = { a: { nested: 1 } } as const;

    // @ts-expect-error not assignable to parameter of type
    Struct.reverse(invalid);
  });
});

describe("pathsOf", () => {
  it("returns NonEmptyReadonlyArray of literal path union", () => {
    const source = { a: { b: 1 }, c: "hello" } as const;
    expect(Struct.pathsOf(source)).type.toBe<A.NonEmptyReadonlyArray<"a" | "a.b" | "c">>();
  });

  it("includes array index paths", () => {
    const source = { items: [{ name: "x" }] } as const;
    type P = typeof source extends infer S extends object ? Extract<import("type-fest").Paths<S>, string> : never;
    expect(Struct.pathsOf(source)).type.toBe<A.NonEmptyReadonlyArray<P>>();
  });
});

describe("entries", () => {
  it("preserves per-key correlated types", () => {
    const source = { a: "foo", b: 1 } as const;
    const result = Struct.entries(source);
    expect(result).type.toBe<Array<["a", "foo"] | ["b", 1]>>();
  });

  it("excludes symbol keys", () => {
    const sym = Symbol("sym");
    const source = { a: "foo", [sym]: true } as const;
    const result = Struct.entries(source);
    expect(result).type.toBe<Array<["a", "foo"]>>();
  });
});

describe("keys", () => {
  it("returns string keys", () => {
    const source = { a: "foo", b: 1 } as const;
    expect(Struct.keys(source)).type.toBe<Array<"a" | "b">>();
  });

  it("excludes symbol keys", () => {
    const sym = Symbol("sym");
    const source = { a: "foo", [sym]: true } as const;
    expect(Struct.keys(source)).type.toBe<Array<"a">>();
  });
});

describe("fromEntries", () => {
  it("preserves per-key value types", () => {
    const result = Struct.fromEntries([
      ["a", 1],
      ["b", "hello"],
    ] as const);
    expect(result).type.toBe<{ a: 1; b: "hello" }>();
  });

  it("roundtrips with entries for const objects", () => {
    const source = { x: 10, y: 20 } as const;
    const result = Struct.fromEntries(Struct.entries(source));
    expect(result).type.toBe<{ x: 10; y: 20 }>();
  });
});
