import { createRoot } from "@beep/logos/createRoot";
import {
  addRuleToUnion,
  addUnionToUnion,
  findUnionById,
} from "@beep/logos/crud";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

const root = createRoot({ logicalOp: "or" });
addRuleToUnion(root, {
  field: "name",
  op: { _tag: "in" },
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "name",
  op: { _tag: "in" },
  _tag: "string",
  value: "alice",
  ignoreCase: false,
});
const union = addUnionToUnion(root, { logicalOp: "and" });
addRuleToUnion(union, {
  field: "age",
  op: { _tag: "gt" },
  _tag: "number",
  value: 18,
});
const rule = addRuleToUnion(union, {
  field: "age",
  op: { _tag: "lt" },
  _tag: "number",
  value: 30,
});
const union2 = addUnionToUnion(union, { logicalOp: "and" });

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
  const result = findUnionById(root, uuid());
  expect(result).toBeUndefined();
});
