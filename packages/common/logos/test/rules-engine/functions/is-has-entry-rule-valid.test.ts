import { HasEntryRule } from "@beep/logos";
import { expect, test } from "vitest";

const bob = { name: "bob", age: 30 };

test("object key & value contains element", () => {
  const rule: HasEntryRule.Input = {
    field: "people",
    op: { _tag: "in" },
    _tag: "hasEntry",
    value: { key: "name", value: "bob" },
  };
  const result = HasEntryRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("object key & value does not contain element", () => {
  const rule: HasEntryRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    _tag: "hasEntry",
    value: { key: "name", value: "alice" },
  };
  const result = HasEntryRule.validate(rule, bob);
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: HasEntryRule.Input = {
    field: "people",
    // @ts-expect-error
    op: "is_more_awesome_than",
    _tag: "hasEntry",
    value: { key: "name", value: "carol" },
  };
  const result = HasEntryRule.validate(rule, bob);
  expect(result).toBeFalsy();
});
