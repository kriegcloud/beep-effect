import { P } from "@beep/utils";
import { describe, expect, it } from "vitest";

describe("Predicate utilities", () => {
  it("checks required properties in data-first and data-last forms", () => {
    expect(P.hasProperties({ foo: 1, bar: 2 }, ["foo", "bar"] as const)).toBe(true);
    expect(P.hasProperties("foo", "bar")({ foo: 1, bar: 2 })).toBe(true);
    expect(P.hasProperties({ foo: 1 }, ["foo", "bar"] as const)).toBe(false);
    expect(P.hasProperties(null, ["foo"] as const)).toBe(false);
  });
});
