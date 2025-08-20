import { isGenericComparisonRuleValid } from "@beep/logos/rules-engine/functions/is-generic-comparison-rule-valid";
import type { BaseGenericComparisonRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("value is equal to", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    operator: "is_equal_to",
    _tag: "generic_comparison",
    value: 2,
  };
  const result = isGenericComparisonRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("value does not equal to", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    operator: "is_not_equal_to",
    _tag: "generic_comparison",
    value: 1,
  };
  const result = isGenericComparisonRuleValid(rule, 2);
  expect(result).toBeTruthy();
});

test("value is greater than", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    operator: "is_greater_than",
    _tag: "generic_comparison",
    value: "alice",
  };
  const result = isGenericComparisonRuleValid(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is greater than or equal to", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    operator: "is_greater_than_or_equal_to",
    _tag: "generic_comparison",
    value: "alice",
  };
  const result = isGenericComparisonRuleValid(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is less than", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    operator: "is_less_than",
    _tag: "generic_comparison",
    value: "bob",
  };
  const result = isGenericComparisonRuleValid(rule, "alice");
  expect(result).toBeTruthy();
});

test("value is less than or equal to", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    operator: "is_less_than_or_equal_to",
    _tag: "generic_comparison",
    value: "bob",
  };
  const result = isGenericComparisonRuleValid(rule, "alice");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseGenericComparisonRule = {
    field: "names",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "generic_comparison",
    value: 1,
  };
  const result = isGenericComparisonRuleValid(rule, 1);
  expect(result).toBeFalsy();
});
