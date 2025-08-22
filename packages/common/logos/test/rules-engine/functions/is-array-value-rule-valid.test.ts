import { ArrayValueRule } from "@beep/logos";

import { expect, test } from "vitest";

const bob = { name: "bob" };
const alice = { name: "alice" };
const carol = { name: "carol" };
const people = [bob, alice];
const all_bob = [bob, bob, bob, bob];

test("array contains element", () => {
  const rule: ArrayValueRule.Input = {
    field: "people",
    op: { _tag: "in" },
    type: "arrayValue",
    value: bob,
  };
  const result = ArrayValueRule.validate(rule, people);
  expect(result).toBeTruthy();
});

test("array does not contain element", () => {
  const rule: ArrayValueRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    type: "arrayValue",
    value: carol,
  };
  const result = ArrayValueRule.validate(rule, people);
  expect(result).toBeTruthy();
});

test("array contains all of an element", () => {
  const rule: ArrayValueRule.Input = {
    field: "people",
    op: { _tag: "every" },
    type: "arrayValue",
    value: bob,
  };
  const result = ArrayValueRule.validate(rule, all_bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: ArrayValueRule.Input = {
    field: "people",
    // @ts-expect-error
    op: "is_more_awesome_than",
    type: "arrayValue",
    value: bob,
  };
  const result = ArrayValueRule.validate(rule, people);
  expect(result).toBeFalsy();
});
