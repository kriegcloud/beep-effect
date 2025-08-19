import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { run } from "@beep/logos/rules-engine/functions/run";
import { expect, test } from "vitest";

const root = createRoot({ combinator: "and" });

const union = addUnionToUnion(root, { combinator: "and" });
const firstRule = addRuleToUnion(union, {
  field: "number",
  operator: "is_greater_than",
  _tag: "number",
  value: 18,
});
addRuleToUnion(union, {
  field: "number",
  operator: "is_less_than",
  _tag: "number",
  value: 30,
});
addRuleToUnion(root, {
  field: "string",
  operator: "contains",
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "boolean",
  operator: "is_true",
  _tag: "boolean",
});
addRuleToUnion(root, {
  field: "array",
  operator: "contains",
  _tag: "array_value",
  value: "alice",
});
addRuleToUnion(root, {
  field: "array",
  operator: "is_equal_to",
  _tag: "array_length",
  value: 1,
});
addRuleToUnion(root, {
  field: "object",
  operator: "contains",
  _tag: "object_key",
  value: "name",
});
addRuleToUnion(root, {
  field: "object",
  operator: "contains",
  _tag: "object_value",
  value: "bob",
});
addRuleToUnion(root, {
  field: "object",
  operator: "contains",
  _tag: "object_key_value_pair",
  value: { key: "name", value: "bob" },
});
addRuleToUnion(root, {
  field: "generic",
  operator: "is_equal_to",
  _tag: "generic_comparison",
  value: "bob",
});
addRuleToUnion(root, {
  field: "generic",
  operator: "is_truthy",
  _tag: "generic_type",
});
const orUnion = addUnionToUnion(root, { combinator: "or" });
addRuleToUnion(orUnion, {
  field: "number",
  operator: "is_less_than",
  _tag: "number",
  value: 30,
});
addRuleToUnion(orUnion, {
  field: "string",
  operator: "contains",
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});

test("rules engine passes", () => {
  const result = run(root, {
    string: "bob",
    boolean: true,
    number: 20,
    array: ["alice"],
    object: { name: "bob" },
    generic: "bob",
  });
  expect(result).toBeTruthy();
});

test("rules engine fails", () => {
  root.combinator = "and";
  const result = run(root, {
    string: "bob",
    boolean: true,
    number: 20,
    array: ["alice"],
    object: { name: "bob" },
    generic: "bobby",
  });
  expect(result).toBeFalsy();
});

test("test invalid rule", () => {
  const invalidRule = { ...firstRule };
  // @ts-expect-error
  delete invalidRule.id;

  root.rules.splice(0, 1, invalidRule);
  expect(() => run(root, {})).toThrowError();
  root.rules.splice(0, 1, firstRule);
});

test("test no rules available", () => {
  const noRuleRoot = createRoot({ combinator: "and" });
  const result = run(noRuleRoot, {});
  expect(result).toBeTruthy();
});
