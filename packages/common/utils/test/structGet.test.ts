import { dotGet, dotGetOption } from "@beep/utils";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import { describe, expect, expectTypeOf, it } from "vitest";

describe("@beep/utils dotGet", () => {
  it("supports data-first and data-last calls", () => {
    const source = { attributes: { name: "beep" }, kind: "example" } as const;

    const dataFirst = dotGet(source, "attributes.name");
    const dataLast = pipe(source, dotGet("attributes.name"));

    expect(dataFirst).toBe("beep");
    expect(dataLast).toBe("beep");
    expectTypeOf(dataFirst).toEqualTypeOf<"beep">();
    expectTypeOf(dataLast).toEqualTypeOf<"beep">();
  });

  it("supports top-level keys", () => {
    const source = { kind: "example" } as const;
    expect(dotGet(source, "kind")).toBe("example");
  });

  it("supports tuple paths", () => {
    const source = { "attributes.name": "flat", attributes: { name: "nested" } } as const;
    const dataFirst = dotGet(source, ["attributes", "name"] as const);
    const dataLast = pipe(source, dotGet(["attributes.name"] as const));

    expect(dataFirst).toBe("nested");
    expect(dataLast).toBe("flat");
    expectTypeOf(dataFirst).toEqualTypeOf<"nested">();
    expectTypeOf(dataLast).toEqualTypeOf<"flat">();
  });

  it("returns undefined when runtime data does not satisfy the path", () => {
    const runtimeMismatch = { attributes: {} } as unknown as { attributes: { name: string } };
    expect(dotGet(runtimeMismatch, "attributes.name")).toBeUndefined();
  });

  it("supports nested access through optional properties", () => {
    const withAttributes: { attributes?: { name: string } } = { attributes: { name: "beep" } };
    const withoutAttributes: { attributes?: { name: string } } = {};

    const maybeNameA = dotGet(withAttributes, "attributes.name");
    const maybeNameB = dotGet(withoutAttributes, "attributes.name");

    expectTypeOf(maybeNameA).toEqualTypeOf<string | undefined>();
    expectTypeOf(maybeNameB).toEqualTypeOf<string | undefined>();
    expect(maybeNameA).toBe("beep");
    expect(maybeNameB).toBeUndefined();
  });

  it("returns Option values with path existence semantics", () => {
    const source = { attributes: { name: "beep" }, maybeUndefined: undefined as string | undefined } as const;
    const missing = { attributes: {} } as unknown as { attributes: { name: string } };

    const some = dotGetOption(source, "attributes.name");
    const someFromTuple = pipe(source, dotGetOption(["attributes", "name"] as const));
    const someUndefined = dotGetOption(source, "maybeUndefined");
    const none = dotGetOption(missing, "attributes.name");

    expect(Option.isSome(some)).toBe(true);
    expect(Option.isSome(someFromTuple)).toBe(true);
    expect(Option.isSome(someUndefined)).toBe(true);
    expect(Option.isNone(none)).toBe(true);
  });
});
// bench
