import { Struct } from "@beep/utils";
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
