import { Struct } from "@beep/utils";
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

  it("rejects invalid or open-record paths", () => {
    const source = { attributes: { name: "beep" } } as const;
    const notAStruct = {} as Record<string, unknown>;

    // @ts-expect-error not assignable to parameter of type
    Struct.dotGet(source, "attributes.missing");

    // @ts-expect-error not assignable to parameter of type
    Struct.dotGet(notAStruct, "attributes.name");

    // @ts-expect-error not assignable to parameter of type
    Struct.dotGet(source, ["attributes", "missing"] as const);
  });

  it("includes undefined in value types when a path crosses optional properties", () => {
    const maybeAttributes: { attributes?: { name: string } } = {};
    expect(Struct.dotGet(maybeAttributes, "attributes.name")).type.toBe<string | undefined>();
    expect(Struct.dotGetOption(maybeAttributes, "attributes.name")).type.toBe<O.Option<string | undefined>>();
  });
});
// bench

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
