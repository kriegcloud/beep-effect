import { StringRule } from "@beep/logos";
import { expect, test } from "vitest";

test("string equals to", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: { _tag: "eq" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = StringRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("string equals to (case insensitive)", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: { _tag: "eq" },
    type: "string",
    value: "BOB",
    ignoreCase: true,
  };
  const result = StringRule.validate(rule, "BoB");
  expect(result).toBeTruthy();
});

test("string not equals to", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: { _tag: "ne" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = StringRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

test("string contains", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: { _tag: "in" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string does not contain", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: { _tag: "notIn" },
    type: "string",
    value: "alice",
    ignoreCase: false,
  };
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string starts with", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: {
      _tag: "startsWith",
    },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string ends with", () => {
  const rule: StringRule.Input = {
    field: "people",
    op: {
      _tag: "endsWith",
    },
    type: "string",
    value: "bby",
    ignoreCase: false,
  };
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: StringRule.Input = {
    field: "people",
    // @ts-expect-error
    op: "is_more_awesome_than",
    type: "string",
    value: "carol",
  };
  const result = StringRule.validate(rule, "carolS");
  expect(result).toBeFalsy();
});
