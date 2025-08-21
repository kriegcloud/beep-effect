import { ArrayLengthRule } from "@beep/logos";
import { expect, test } from "vitest";

const names = ["bob", "alice"];

test("array length is equal to", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: { _tag: "eq" },
    _tag: "arrayLength",
    value: 2,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length does not equal to", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: { _tag: "ne" },
    _tag: "arrayLength",
    value: 1,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is greater than", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: { _tag: "gt" },
    _tag: "arrayLength",
    value: 1,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is greater than or equal to", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: { _tag: "gte" },
    _tag: "arrayLength",
    value: 2,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is less than", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: { _tag: "lt" },
    _tag: "arrayLength",
    value: 3,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("array length is less than or equal to", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: { _tag: "lte" },
    _tag: "arrayLength",
    value: 2,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: ArrayLengthRule.Input = {
    field: "names",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
    },
    _tag: "arrayLength",
    value: 2,
  };
  const result = ArrayLengthRule.validate(rule, names);
  expect(result).toBeFalsy();
});
