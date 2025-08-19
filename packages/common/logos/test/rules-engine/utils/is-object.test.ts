import { isObject } from "@beep/logos/rules-engine/utils/is-object";
import { expect, test } from "vitest";

test("is an object", () => {
  expect(isObject({})).toBeTruthy();
});

test("is not an object", () => {
  expect(isObject("")).toBeFalsy();
});
