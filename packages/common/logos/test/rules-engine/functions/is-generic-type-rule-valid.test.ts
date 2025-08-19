import { isGenericTypeRuleValid } from "@beep/logos/rules-engine/functions/is-generic-type-rule-valid";
import { BaseGenericTypeRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("value is truth", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_truthy",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is falsey", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_falsy",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, undefined);
  expect(result).toBeTruthy();
});

test("value is null", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_null",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, null);
  expect(result).toBeTruthy();
});

test("value is not null", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_null",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, {});
  expect(result).toBeTruthy();
});

test("value is undefined", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_undefined",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, undefined);
  expect(result).toBeTruthy();
});

test("value is not undefined", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_undefined",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, false);
  expect(result).toBeTruthy();
});

test("value is string", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_string",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, "alice");
  expect(result).toBeTruthy();
});

test("value is not string", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_string",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, 12345);
  expect(result).toBeTruthy();
});

test("value is number", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_number",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, 123.4);
  expect(result).toBeTruthy();
});

test("value is not number", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_number",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, "12345");
  expect(result).toBeTruthy();
});

test("value is boolean", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_boolean",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, false);
  expect(result).toBeTruthy();
});

test("value is not boolean", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_boolean",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, "false");
  expect(result).toBeTruthy();
});

test("value is array", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_array",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, []);
  expect(result).toBeTruthy();
});

test("value is not array", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_array",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, "[]");
  expect(result).toBeTruthy();
});

test("value is object", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_object",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, { name: "bob" });
  expect(result).toBeTruthy();
});

test("value is not array", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    operator: "is_not_object",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, "{}");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseGenericTypeRule = {
    field: "name",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "generic_type",
  };
  const result = isGenericTypeRuleValid(rule, undefined);
  expect(result).toBeFalsy();
});
