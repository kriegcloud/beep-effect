import { NumberRule } from "@beep/logos";
import { expect, test } from "vitest";

test("number is equal to", () => {
  const rule: NumberRule.Input = {
    field: "names",
    op: { _tag: "eq" },
    type: "number",
    value: 2,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number does not equal to", () => {
  const rule: NumberRule.Input = {
    field: "names",
    op: { _tag: "ne" },
    type: "number",
    value: 1,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than", () => {
  const rule: NumberRule.Input = {
    field: "names",
    op: { _tag: "gt" },
    type: "number",
    value: 1,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than or equal to", () => {
  const rule: NumberRule.Input = {
    field: "names",
    op: { _tag: "gte" },
    type: "number",
    value: 2,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than", () => {
  const rule: NumberRule.Input = {
    field: "names",
    op: { _tag: "lt" },
    type: "number",
    value: 3,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than or equal to", () => {
  const rule: NumberRule.Input = {
    field: "names",
    op: { _tag: "lte" },
    type: "number",
    value: 2,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: NumberRule.Input = {
    field: "names",
    // @ts-expect-error
    op: "is_more_awesome_than",
    type: "number",
    value: 2,
  };
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeFalsy();
});
