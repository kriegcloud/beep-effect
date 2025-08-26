import { NumberRule } from "@beep/logos/v2/rules";
import { expect, test } from "vitest";

test("number is equal to", () => {
  const rule = NumberRule.make({
    field: "names",
    op: { _tag: "eq", value: 2 },
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number does not equal to", () => {
  const rule = NumberRule.make({
    field: "names",
    op: { _tag: "ne", value: 1 },
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than", () => {
  const rule = NumberRule.make({
    field: "names",
    op: { _tag: "gt", value: 1 },
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than or equal to", () => {
  const rule = NumberRule.make({
    field: "names",
    op: { _tag: "gte", value: 2 },
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than", () => {
  const rule = NumberRule.make({
    field: "names",
    op: { _tag: "lt", value: 3 },
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than or equal to", () => {
  const rule = NumberRule.make({
    field: "names",
    op: { _tag: "lte", value: 2 },
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: NumberRule.Input.Type = {
    field: "names",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
      value: 2,
    },
    type: "number",
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeFalsy();
});
