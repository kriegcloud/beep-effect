import { GenericComparisonRule } from "@beep/logos";
import { expect, test } from "vitest";

test("value is equal to", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    op: { _tag: "eq" },
    _tag: "genericComparison",
    value: 2,
  };
  const result = GenericComparisonRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("value does not equal to", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    op: { _tag: "ne" },
    _tag: "genericComparison",
    value: 1,
  };
  const result = GenericComparisonRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("value is greater than", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    op: { _tag: "gt" },
    _tag: "genericComparison",
    value: "alice",
  };
  const result = GenericComparisonRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is greater than or equal to", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    op: { _tag: "gte" },
    _tag: "genericComparison",
    value: "alice",
  };
  const result = GenericComparisonRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is less than", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    op: { _tag: "lt" },
    _tag: "genericComparison",
    value: "bob",
  };
  const result = GenericComparisonRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

test("value is less than or equal to", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    op: { _tag: "lte" },
    _tag: "genericComparison",
    value: "bob",
  };
  const result = GenericComparisonRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: GenericComparisonRule.Input = {
    field: "names",
    // @ts-expect-error
    op: "is_more_awesome_than",
    _tag: "genericComparison",
    value: 1,
  };
  const result = GenericComparisonRule.validate(rule, 1);
  expect(result).toBeFalsy();
});
