import { ObjectKeyRule } from "@beep/logos";
import { expect, test } from "vitest";

const bob = { name: "bob" };

test("object key contains element", () => {
  const rule: ObjectKeyRule.Input = {
    field: "people",
    op: { _tag: "in" },
    _tag: "objectKey",
    value: "name",
  };
  const result = ObjectKeyRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("object key does not contain element", () => {
  const rule: ObjectKeyRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    _tag: "objectKey",
    value: "age",
  };
  const result = ObjectKeyRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: ObjectKeyRule.Input = {
    field: "people",
    // @ts-expect-error
    op: "is_more_awesome_than",
    _tag: "objectKey",
    value: "height",
  };
  const result = ObjectKeyRule.validate(rule, bob);
  expect(result).toBeFalsy();
});
