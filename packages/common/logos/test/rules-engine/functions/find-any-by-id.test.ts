import { RootGroup } from "@beep/logos";
import { addGroup, addRuleToGroup, findAnyById } from "@beep/logos/crud";
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
  op: {
    _tag: "gt",
  },
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
  const result = findAnyById(root, root.id);
  expect(result).toBe(root);
});

test("find deeply nested rule", () => {
  const result = findAnyById(root, rule.id);
  expect(result).toBe(rule);
});

test("find deeply nested group", () => {
  const result = findAnyById(root, group2.id);
  expect(result).toBe(group2);
});

test("find non existent rule", () => {
  const result = findAnyById(root, uuid());
  expect(result).toBeUndefined();
});
