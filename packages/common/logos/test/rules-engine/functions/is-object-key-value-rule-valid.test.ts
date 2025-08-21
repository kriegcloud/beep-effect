import { ObjectKeyValueRule } from "@beep/logos";
import { expect, test } from "vitest";

const bob = { name: "bob", age: 30 };

test("object key & value contains element", () => {
  const rule: ObjectKeyValueRule.Input = {
    field: "people",
    op: { _tag: "in" },
    _tag: "objectKeyValue",
    value: { key: "name", value: "bob" },
  };
  const result = ObjectKeyValueRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("object key & value does not contain element", () => {
  const rule: ObjectKeyValueRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    _tag: "objectKeyValue",
    value: { key: "name", value: "alice" },
  };
  const result = ObjectKeyValueRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: ObjectKeyValueRule.Input = {
    field: "people",
    // @ts-expect-error
    op: "is_more_awesome_than",
    _tag: "objectKeyValue",
    value: { key: "name", value: "carol" },
  };
  const result = ObjectKeyValueRule.validate(rule, bob);
  expect(result).toBeFalsy();
});
