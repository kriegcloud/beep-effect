import { isStringRuleValid } from "@beep/logos/rules-engine/functions/is-string-rule-valid";
import type { BaseStringRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("string equals to", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "is_equal_to",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = isStringRuleValid(rule, "bob");
  expect(result).toBeTruthy();
});

test("string equals to (case insensitve)", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "is_equal_to",
    _tag: "string",
    value: "BOB",
    ignoreCase: true,
  };
  const result = isStringRuleValid(rule, "BoB");
  expect(result).toBeTruthy();
});

test("string not equals to", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "is_not_equal_to",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = isStringRuleValid(rule, "alice");
  expect(result).toBeTruthy();
});

test("string contains", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = isStringRuleValid(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string does not contain", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "does_not_contain",
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  };
  const result = isStringRuleValid(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string starts with", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "starts_with",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = isStringRuleValid(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string ends with", () => {
  const rule: BaseStringRule = {
    field: "people",
    operator: "ends_with",
    _tag: "string",
    value: "bby",
    ignoreCase: false,
  };
  const result = isStringRuleValid(rule, "bobby");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseStringRule = {
    field: "people",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "string",
    value: "carol",
  };
  const result = isStringRuleValid(rule, "carolS");
  expect(result).toBeFalsy();
});
