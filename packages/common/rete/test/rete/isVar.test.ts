import { isVar } from "@beep/rete/rete/is-var";
import { describe, expect, it } from "@effect/vitest";

describe("isVar...", () => {
  it("successfully detects a var", () => {
    const aVar = { name: "test", field: "a field" };
    expect(isVar(aVar)).toBeTruthy();

    const anotherVar = { name: "test", field: "a field", thing: "a thing" };
    expect(isVar(anotherVar)).toBeTruthy();
  });

  it("something that's not a var isn't a var ", () => {
    const noName = { field: "a field" };
    expect(isVar(noName)).toBeFalsy();

    const noField = { name: "a name" };
    expect(isVar(noField)).toBeFalsy();

    const randomStuff = { random: "stuff" };
    expect(isVar(randomStuff)).toBeFalsy();

    const nothing = {};
    expect(isVar(nothing)).toBeFalsy();

    const undef = undefined;
    expect(isVar(undef)).toBeFalsy();
  });
});
