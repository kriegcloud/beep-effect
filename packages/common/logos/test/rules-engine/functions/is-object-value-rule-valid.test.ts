import { isObjectValueRuleValid } from "@beep/logos/rules-engine/functions/is-object-value-rule-valid";
import { BaseObjectValueRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

const bob = { name: "bob" };

test("object value contains element", () => {
  const rule: BaseObjectValueRule = {
    field: "people",
    operator: "contains",
    _tag: "object_value",
    value: "bob",
  };
  const result = isObjectValueRuleValid(rule, bob);
  expect(result).toBeTruthy();
});

test("object value does not contain element", () => {
  const rule: BaseObjectValueRule = {
    field: "people",
    operator: "does_not_contain",
    _tag: "object_value",
    value: "alice",
  };
  const result = isObjectValueRuleValid(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseObjectValueRule = {
    field: "people",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "object_value",
    value: "carol",
  };
  const result = isObjectValueRuleValid(rule, bob);
  expect(result).toBeFalsy();
});
