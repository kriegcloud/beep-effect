import { isArrayValueRuleValid } from "@beep/logos/rules-engine/functions/is-array-value-rule-valid";
import type { BaseArrayValueRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

const bob = { name: "bob" };
const alice = { name: "alice" };
const carol = { name: "carol" };
const people = [bob, alice];
const all_bob = [bob, bob, bob, bob];

test("array contains element", () => {
  const rule: BaseArrayValueRule = {
    field: "people",
    operator: "contains",
    _tag: "array_value",
    value: bob,
  };
  const result = isArrayValueRuleValid(rule, people);
  expect(result).toBeTruthy();
});

test("array does not contain element", () => {
  const rule: BaseArrayValueRule = {
    field: "people",
    operator: "does_not_contain",
    _tag: "array_value",
    value: carol,
  };
  const result = isArrayValueRuleValid(rule, people);
  expect(result).toBeTruthy();
});

test("array contains all of an element", () => {
  const rule: BaseArrayValueRule = {
    field: "people",
    operator: "contains_all",
    _tag: "array_value",
    value: bob,
  };
  const result = isArrayValueRuleValid(rule, all_bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseArrayValueRule = {
    field: "people",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "array_value",
    value: bob,
  };
  const result = isArrayValueRuleValid(rule, people);
  expect(result).toBeFalsy();
});
