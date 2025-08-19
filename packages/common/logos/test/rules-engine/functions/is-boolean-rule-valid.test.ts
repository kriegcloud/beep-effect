import { isBooleanRuleValid } from "@beep/logos/rules-engine/functions/is-boolean-rule-valid";
import { BaseBooleanRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

const isValid = true;
const isInvalid = false;

test("boolean is true", () => {
  const rule: BaseBooleanRule = {
    field: "status",
    operator: "is_true",
    _tag: "boolean",
  };
  const result = isBooleanRuleValid(rule, isValid);
  expect(result).toBeTruthy();
});

test("boolean is false", () => {
  const rule: BaseBooleanRule = {
    field: "status",
    operator: "is_false",
    _tag: "boolean",
  };
  const result = isBooleanRuleValid(rule, isInvalid);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BaseBooleanRule = {
    field: "status",
    // @ts-expect-error
    operator: "is_more_awesome_than",
    _tag: "boolean",
  };
  const result = isBooleanRuleValid(rule, isValid);
  expect(result).toBeFalsy();
});
