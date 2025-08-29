import { StringRule } from "@beep/logos/v2/rules";
import { BS } from "@beep/schema";
import { expect, test } from "vitest";

test("string equals to", () => {
  const rule = StringRule.eq({
    field: "people",
    value: "bob",
    ignoreCase: false,
  });
  const result = StringRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("string equals to (case insensitive)", () => {
  const rule = StringRule.eq({
    field: "people",
    value: "BOB",
    ignoreCase: true,
  });
  const result = StringRule.validate(rule, "BoB");
  expect(result).toBeTruthy();
});

test("string not equals to", () => {
  const rule = StringRule.ne({
    field: "people",
    value: "bob",
    ignoreCase: false,
  });
  const result = StringRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

test("string contains", () => {
  const rule = StringRule.contains({
    field: "people",
    value: "bob",
    ignoreCase: false,
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string does not contain", () => {
  const rule = StringRule.notContains({
    field: "people",
    value: "alice",
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string starts with", () => {
  const rule = StringRule.startsWith({
    field: "people",
    value: "bob",
    ignoreCase: false,
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string ends with", () => {
  const rule = StringRule.endsWith({
    field: "people",
    value: "bby",
    ignoreCase: false,
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string matches regex", () => {
  const rule = StringRule.matches({
    field: "people",
    value: BS.Regex.make(/^bob.*/),
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeTruthy();
});

test("string does not match regex", () => {
  const rule = StringRule.matches({
    field: "people",
    value: BS.Regex.make(/^bob$/),
  });
  const result = StringRule.validate(rule, "bobby");
  expect(result).toBeFalsy();
});
