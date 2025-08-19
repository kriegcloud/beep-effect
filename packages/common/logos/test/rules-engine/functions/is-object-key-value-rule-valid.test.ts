import { isObjectKeyValueRuleValid } from "@beep/logos/rules-engine/functions/is-object-key-value-rule-valid";
import { BaseObjectKeyValuePairRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

const bob = { name: "bob", age: 30 };

test("object key & value contains element", () => {
  const rule: BaseObjectKeyValuePairRule = {
    field: "people",
    operator: "contains",
    _tag: "object_key_value_pair",
    value: { key: "name", value: "bob" },
  };
  const result = isObjectKeyValueRuleValid(rule, bob);
  expect(result).toBeTruthy();
});

test("object key & value does not contain element", () => {
  const rule: BaseObjectKeyValuePairRule = {
    field: "people",
    operator: "does_not_contain",
    _tag: "object_key_value_pair",
    value: { key: "name", value: "alice" },
  };
  const result = isObjectKeyValueRuleValid(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseObjectKeyValuePairRule = {
    field: "people",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "object_key_value_pair",
    value: { key: "name", value: "carol" },
  };
  const result = isObjectKeyValueRuleValid(rule, bob);
  expect(result).toBeFalsy();
});
