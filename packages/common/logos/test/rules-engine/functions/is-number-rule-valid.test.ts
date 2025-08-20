import { isNumberRuleValid } from "@beep/logos/rules-engine/functions/is-number-rule-valid";
import type { BaseNumberRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("number is equal to", () => {
  const rule: BaseNumberRule = {
    field: "names",
    operator: "is_equal_to",
    _tag: "number",
    value: 2,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("number does not equal to", () => {
  const rule: BaseNumberRule = {
    field: "names",
    operator: "is_not_equal_to",
    _tag: "number",
    value: 1,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than", () => {
  const rule: BaseNumberRule = {
    field: "names",
    operator: "is_greater_than",
    _tag: "number",
    value: 1,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than or equal to", () => {
  const rule: BaseNumberRule = {
    field: "names",
    operator: "is_greater_than_or_equal_to",
    _tag: "number",
    value: 2,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than", () => {
  const rule: BaseNumberRule = {
    field: "names",
    operator: "is_less_than",
    _tag: "number",
    value: 3,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than or equal to", () => {
  const rule: BaseNumberRule = {
    field: "names",
    operator: "is_less_than_or_equal_to",
    _tag: "number",
    value: 2,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseNumberRule = {
    field: "names",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "number",
    value: 2,
  };
  const result = isNumberRuleValid(rule, 2);
  expect(result).toBeFalsy();
});
