import { StringRule } from "@beep/logos/v2/rules";
import { BS } from "@beep/schema";
import { expect, test } from "vitest";

test("string equals to", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "eq", value: "bob", ignoreCase: false },
  });
  const result = StringRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("string equals to (case insensitive)", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "eq", value: "BOB", ignoreCase: true },
  });
  const result = StringRule.validate(rule, "BoB");
  expect(result).toBeTruthy();
});

test("string not equals to", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "ne", value: "bob", ignoreCase: false },
  });
  const result = StringRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

test("string contains", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "contains", value: "bob", ignoreCase: false },
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string does not contain", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "notContains", value: "alice", ignoreCase: false },
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string starts with", () => {
  const rule = StringRule.make({
    field: "people",
    op: {
      _tag: "startsWith",
      value: "bob",
      ignoreCase: false,
    },
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string ends with", () => {
  const rule = StringRule.make({
    field: "people",
    op: {
      _tag: "endsWith",
      value: "bby",
      ignoreCase: false,
    },
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: StringRule.Input.Type = {
    field: "people",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
      type: "string",
      value: "carol",
    },
  };
  const result = StringRule.validate(rule, "carolS");
  expect(result).toBeFalsy();
});

test("string matches regex", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "matches", value: BS.Regex.make(/^bob.*/), ignoreCase: false },
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string does not match regex", () => {
  const rule = StringRule.make({
    field: "people",
    op: { _tag: "matches", value: BS.Regex.make(/^bob$/), ignoreCase: false },
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeFalsy();
});
