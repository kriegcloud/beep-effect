import { HasValueRule } from "@beep/logos";
import { expect, test } from "vitest";

const bob = { name: "bob" };

test("object value contains element", () => {
  const rule: HasValueRule.Input = {
    field: "people",
    op: { _tag: "in" },
    type: "hasValue",
    value: "bob",
  };
  const result = HasValueRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("object value does not contain element", () => {
  const rule: HasValueRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    type: "hasValue",
    value: "alice",
  };
  const result = HasValueRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: HasValueRule.Input = {
    field: "people",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
    },
    type: "hasValue",
    value: "carol",
  };
  const result = HasValueRule.validate(rule, bob);
  expect(result).toBeFalsy();
});
