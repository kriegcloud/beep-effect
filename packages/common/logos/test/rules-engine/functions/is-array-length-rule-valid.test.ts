import { isArrayLengthRuleValid } from "@beep/logos/rules-engine/functions/is-array-length-rule-valid";
import { BaseArrayLengthRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

const names = ["bob", "alice"];

test("array length is equal to", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    operator: "is_equal_to",
    _tag: "array_length",
    value: 2,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeTruthy();
});

test("array length does not equal to", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    operator: "is_not_equal_to",
    _tag: "array_length",
    value: 1,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeTruthy();
});

test("array length is greater than", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    operator: "is_greater_than",
    _tag: "array_length",
    value: 1,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeTruthy();
});

test("array length is greater than or equal to", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    operator: "is_greater_than_or_equal_to",
    _tag: "array_length",
    value: 2,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeTruthy();
});

test("array length is less than", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    operator: "is_less_than",
    _tag: "array_length",
    value: 3,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeTruthy();
});

test("array length is less than or equal to", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    operator: "is_less_than_or_equal_to",
    _tag: "array_length",
    value: 2,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseArrayLengthRule = {
    field: "names",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "array_length",
    value: 2,
  };
  const result = isArrayLengthRuleValid(rule, names);
  expect(result).toBeFalsy();
});
