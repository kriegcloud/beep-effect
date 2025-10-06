import { RootGroup } from "@beep/logos";
import { addGroup, addRuleToGroup, findRuleById } from "@beep/logos/crud";

import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

const root = RootGroup.make({ logicalOp: "or" });

addRuleToGroup(root, {
  field: "name",
  op: { _tag: "stringContains" },
  type: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToGroup(root, {
  field: "name",
  op: { _tag: "stringContains" },
  type: "string",
  value: "alice",
  ignoreCase: false,
});
const group = addGroup(root, { logicalOp: "and" });

addRuleToGroup(group, {
  field: "age",
  op: { _tag: "gt" },
  type: "number",
  value: 18,
});
const rule = addRuleToGroup(group, {
  field: "age",
  op: { _tag: "lt" },
  type: "number",
  value: 30,
});
const group2 = addGroup(group, { logicalOp: "and" });

test("find root group", () => {
  const result = findRuleById(root, root.id);
  expect(result).toBeUndefined();
});

test("find deeply nested rule", () => {
  const result = findRuleById(root, rule.id);
  expect(result).toBe(rule);
});

test("find deeply nested group", () => {
  const result = findRuleById(root, group2.id);
  expect(result).toBeUndefined();
});

test("find non existent rule", () => {
  const result = findRuleById(root, uuid());
  expect(result).toBeUndefined();
});
