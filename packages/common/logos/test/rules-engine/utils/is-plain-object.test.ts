import { isPlainObject } from "@beep/logos/utils/is-plain-object";
import { expect, test } from "vitest";

test("is an object", () => {
  expect(isPlainObject({})).toBeTruthy();
});

test("is not an object", () => {
  expect(isPlainObject("")).toBeFalsy();
});
