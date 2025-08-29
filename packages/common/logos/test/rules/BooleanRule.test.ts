import { BooleanRule } from "@beep/logos/v2/rules";
import { expect, test } from "vitest";

const isValid = true;
const isInvalid = false;

test("boolean is true", () => {
  const rule = BooleanRule.isTrue({
    field: "status",
  });
  const result = BooleanRule.validate(rule, isValid);
  expect(result).toBeTruthy();
});

test("boolean is false", () => {
  const rule = BooleanRule.isFalse({
    field: "status",
  });
  const result = BooleanRule.validate(rule, isInvalid);
  expect(result).toBeTruthy();
});


