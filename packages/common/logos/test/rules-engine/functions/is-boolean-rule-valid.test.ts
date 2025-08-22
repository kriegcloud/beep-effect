import { BooleanRule } from "@beep/logos";
import { expect, test } from "vitest";

const isValid = true;
const isInvalid = false;

test("boolean is true", () => {
  const rule: BooleanRule.Input = {
    field: "status",
    op: {
      _tag: "isTrue",
    },
    type: "boolean",
  };
  const result = BooleanRule.validate(rule, isValid);
  expect(result).toBeTruthy();
});

test("boolean is false", () => {
  const rule: BooleanRule.Input = {
    field: "status",
    op: {
      _tag: "isFalse",
    },
    type: "boolean",
  };
  const result = BooleanRule.validate(rule, isInvalid);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: BooleanRule.Input = {
    field: "status",
    // @ts-expect-error
    op: "is_more_awesome_than",
    type: "boolean",
  };
  const result = BooleanRule.validate(rule, isValid);
  expect(result).toBeFalsy();
});
