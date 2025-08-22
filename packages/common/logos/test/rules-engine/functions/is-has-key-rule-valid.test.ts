import { HasKeyRule } from "@beep/logos";
import { expect, test } from "vitest";

const bob = { name: "bob" };

test("object key contains element", () => {
  const rule: HasKeyRule.Input = {
    field: "people",
    op: { _tag: "in" },
    _tag: "hasKey",
    value: "name",
  };
  const result = HasKeyRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("object key does not contain element", () => {
  const rule: HasKeyRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    _tag: "hasKey",
    value: "age",
  };
  const result = HasKeyRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: HasKeyRule.Input = {
    field: "people",
    // @ts-expect-error
    op: "is_more_awesome_than",
    _tag: "hasKey",
    value: "height",
  };
  const result = HasKeyRule.validate(rule, bob);
  expect(result).toBeFalsy();
});
