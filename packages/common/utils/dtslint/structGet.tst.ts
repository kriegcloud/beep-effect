import type * as Option from "effect/Option";
import { describe, expect, it } from "tstyche";
import { structGet, structGetOption } from "../src/index.js";

describe("structGet", () => {
  it("resolves nested path value types", () => {
    const source = { attributes: { name: "beep" as const }, kind: "example" as const } as const;

    expect(structGet(source, "attributes.name")).type.toBe<"beep">();
    expect(structGet(source, "kind")).type.toBe<"example">();
    expect(structGet(source, ["attributes", "name"] as const)).type.toBe<"beep">();

    const getName = structGet("attributes.name");
    expect(getName(source)).type.toBe<"beep">();

    const getNameFromTuple = structGet(["attributes", "name"] as const);
    expect(getNameFromTuple(source)).type.toBe<"beep">();
  });

  it("resolves Option return types", () => {
    const source = { attributes: { name: "beep" as const } } as const;
    expect(structGetOption(source, "attributes.name")).type.toBe<Option.Option<"beep">>();
    expect(structGetOption(source, ["attributes", "name"] as const)).type.toBe<Option.Option<"beep">>();
  });

  it("rejects invalid or open-record paths", () => {
    const source = { attributes: { name: "beep" } } as const;
    const notAStruct = {} as Record<string, unknown>;

    // @ts-expect-error not assignable to parameter of type
    structGet(source, "attributes.missing");

    // @ts-expect-error not assignable to parameter of type
    structGet(notAStruct, "attributes.name");

    // @ts-expect-error not assignable to parameter of type
    structGet(source, ["attributes", "missing"] as const);
  });

  it("includes undefined in value types when a path crosses optional properties", () => {
    const maybeAttributes: { attributes?: { name: string } } = {};
    expect(structGet(maybeAttributes, "attributes.name")).type.toBe<string | undefined>();
    expect(structGetOption(maybeAttributes, "attributes.name")).type.toBe<Option.Option<string | undefined>>();
  });
});
