import { ObjectValueRule } from "@beep/logos";
import { expect, test } from "vitest";

const bob = { name: "bob" };

test("object value contains element", () => {
  const rule: ObjectValueRule.Input = {
    field: "people",
    op: { _tag: "in" },
    _tag: "objectValue",
    value: "bob",
  };
  const result = ObjectValueRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("object value does not contain element", () => {
  const rule: ObjectValueRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    _tag: "objectValue",
    value: "alice",
  };
  const result = ObjectValueRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: ObjectValueRule.Input = {
    field: "people",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
    },
    _tag: "objectValue",
    value: "carol",
  };
  const result = ObjectValueRule.validate(rule, bob);
  expect(result).toBeFalsy();
});
