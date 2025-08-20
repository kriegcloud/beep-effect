import { isObjectKeyRuleValid } from "@beep/logos/rules-engine/functions/is-object-key-rule-valid";
import type { BaseObjectKeyRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

const bob = { name: "bob" };

test("object key contains element", () => {
  const rule: BaseObjectKeyRule = {
    field: "people",
    operator: "contains",
    _tag: "object_key",
    value: "name",
  };
  const result = isObjectKeyRuleValid(rule, bob);
  expect(result).toBeTruthy();
});

test("object key does not contain element", () => {
  const rule: BaseObjectKeyRule = {
    field: "people",
    operator: "does_not_contain",
    _tag: "object_key",
    value: "age",
  };
  const result = isObjectKeyRuleValid(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseObjectKeyRule = {
    field: "people",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "object_key",
    value: "height",
  };
  const result = isObjectKeyRuleValid(rule, bob);
  expect(result).toBeFalsy();
});
