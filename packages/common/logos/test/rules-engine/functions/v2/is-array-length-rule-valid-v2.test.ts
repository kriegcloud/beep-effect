import { ArrayLengthRule } from "@beep/logos/v2/rules";
import { expect, test } from "vitest";

const names = ["bob", "alice"];
// TODO(ben): CREATE A TEST FOR THE BETWEEN CASE!!!
test("array length is equal to", () => {
  const rule = ArrayLengthRule.eq({
    field: "names",
    value: 2,
  });
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length does not equal to", () => {
  const rule = ArrayLengthRule.ne({
    field: "names",
    value: 1,
  });
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is greater than", () => {
  const rule = ArrayLengthRule.gt({
    field: "names",
    value: 1,
  });
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is greater than or equal to", () => {
  const rule = ArrayLengthRule.gte({
    field: "names",
    value: 2,
  });
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is less than", () => {
  const rule = ArrayLengthRule.lt({
    field: "names",
    value: 3,
  });
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is less than or equal to", () => {
  const rule = ArrayLengthRule.lte({
    field: "names",
    value: 2,
  });
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: ArrayLengthRule.Input.Type = {
    field: "names",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
      value: 2,
    },
    type: "arrayLength",
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeFalsy();
});
