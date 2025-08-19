import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { findUnionById } from "@beep/logos/rules-engine/functions/find-union-by-id";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";

const root = createRoot({ combinator: "or" });
addRuleToUnion(root, {
  field: "name",
  operator: "contains",
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "name",
  operator: "contains",
  _tag: "string",
  value: "alice",
  ignoreCase: false,
});
const union = addUnionToUnion(root, { combinator: "and" });
addRuleToUnion(union, {
  field: "age",
  operator: "is_greater_than",
  _tag: "number",
  value: 18,
});
const rule = addRuleToUnion(union, {
  field: "age",
  operator: "is_less_than",
  _tag: "number",
  value: 30,
});
const union2 = addUnionToUnion(union, { combinator: "and" });

test("find root union", () => {
  const result = findUnionById(root, root.id);
  expect(result).toBe(root);
});

test("find deeply nested rule", () => {
  const result = findUnionById(root, rule.id);
  expect(result).toBeUndefined();
});

test("find deeply nested union", () => {
  const result = findUnionById(root, union2.id);
  expect(result).toBe(union2);
});

test("find non existent rule", () => {
  const result = findUnionById(root, uuidv4());
  expect(result).toBeUndefined();
});
