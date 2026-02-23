import type * as Option from "effect/Option";
import { describe, expect, it } from "tstyche";
import { dotGet, dotGetOption } from "../src/index.js";

describe("dotGet", () => {
  it("resolves nested path value types", () => {
    const source = { attributes: { name: "beep" as const }, kind: "example" as const } as const;

    expect(dotGet(source, "attributes.name")).type.toBe<"beep">();
    expect(dotGet(source, "kind")).type.toBe<"example">();
    expect(dotGet(source, ["attributes", "name"] as const)).type.toBe<"beep">();

    const getName = dotGet("attributes.name");
    expect(getName(source)).type.toBe<"beep">();

    const getNameFromTuple = dotGet(["attributes", "name"] as const);
    expect(getNameFromTuple(source)).type.toBe<"beep">();
  });

  it("resolves Option return types", () => {
    const source = { attributes: { name: "beep" as const } } as const;
    expect(dotGetOption(source, "attributes.name")).type.toBe<Option.Option<"beep">>();
    expect(dotGetOption(source, ["attributes", "name"] as const)).type.toBe<Option.Option<"beep">>();
  });

  it("rejects invalid or open-record paths", () => {
    const source = { attributes: { name: "beep" } } as const;
    const notAStruct = {} as Record<string, unknown>;

    // @ts-expect-error not assignable to parameter of type
    dotGet(source, "attributes.missing");

    // @ts-expect-error not assignable to parameter of type
    dotGet(notAStruct, "attributes.name");

    // @ts-expect-error not assignable to parameter of type
    dotGet(source, ["attributes", "missing"] as const);
  });

  it("includes undefined in value types when a path crosses optional properties", () => {
    const maybeAttributes: { attributes?: { name: string } } = {};
    expect(dotGet(maybeAttributes, "attributes.name")).type.toBe<string | undefined>();
    expect(dotGetOption(maybeAttributes, "attributes.name")).type.toBe<Option.Option<string | undefined>>();
  });
});
// bench
