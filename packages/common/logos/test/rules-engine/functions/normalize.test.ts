import { expect, test } from "bun:test";
import { RootGroup } from "@beep/logos";
import { addGroup, addRuleToGroup } from "@beep/logos/crud";
import { normalize } from "@beep/logos/normalize";
import type { UnsafeTypes } from "@beep/types";
import { v4 as uuid } from "uuid";

test("normalization removes an invalid rule", () => {
  const root = RootGroup.make({ logicalOp: "or" });

  const rule: UnsafeTypes.UnsafeAny = addRuleToGroup(root, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });
  rule.type = "number";

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization fixes the parent id of a rule", () => {
  const root = RootGroup.make({ logicalOp: "or" });

  const rule: UnsafeTypes.UnsafeAny = addRuleToGroup(root, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });
  rule.parentId = uuid();

  root.rules.forEach((rule) => {
    expect(rule.parentId).not.toBe(root.id);
  });
  expect(root.rules[0]?.parentId).not.toBe(root.id);
  normalize(root);
  root.rules.forEach((rule) => {
    expect(rule.parentId).toBe(root.id);
  });
});

test("normalization removes an invalid group", () => {
  const root = RootGroup.make({ logicalOp: "or" });

  const group = addGroup(root, { logicalOp: "and" });
  addRuleToGroup(group, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });
  // @ts-expect-error
  group.logicalOp = "invalid";

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization removes an group with no rules", () => {
  const root = RootGroup.make({ logicalOp: "or" });
  addGroup(root, { logicalOp: "and" });

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization promotes group with 1 rule to parent level", () => {
  const root = RootGroup.make({ logicalOp: "or" });
  addRuleToGroup(root, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });

  const group = addGroup(root, { logicalOp: "and" });
  const rule = addRuleToGroup(group, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "alice",
    ignoreCase: false,
  });

  expect(root.rules[1]?.node).toBe("group");
  expect(root.rules[1]?.id).toBe(group.id);

  normalize(root);

  expect(root.rules[1]?.node).toBe("rule");
  expect(root.rules[1]?.id).toBe(rule.id);
});

test("normalization finds nothing wrong", () => {
  const root = RootGroup.make({ logicalOp: "or" });
  addRuleToGroup(root, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });

  const group = addGroup(root, { logicalOp: "and" });
  addRuleToGroup(group, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "alice",
    ignoreCase: false,
  });
  addRuleToGroup(group, {
    field: "age",
    op: { _tag: "gt" },
    type: "number",
    value: 18,
  });

  expect(root.rules).toHaveLength(2);
  root.rules.forEach((rule) => {
    expect(rule.parentId).toBe(root.id);
  });

  normalize(root);

  expect(root.rules).toHaveLength(2);
  root.rules.forEach((rule) => {
    expect(rule.parentId).toBe(root.id);
  });
});

test("normalization has all options turn off", () => {
  const root = RootGroup.make({ logicalOp: "or" });
  addRuleToGroup(root, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });

  const group = addGroup(root, { logicalOp: "and" });
  const rule: UnsafeTypes.UnsafeAny = addRuleToGroup(group, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "alice",
    ignoreCase: false,
  });
  addRuleToGroup(group, {
    field: "age",
    op: { _tag: "gt" },
    type: "number",
    value: 18,
  });

  expect(group.parentId).toBe(root.id);
  expect(rule.parentId).toBe(group.id);

  group.parentId = uuid();
  rule.parentId = uuid();

  normalize(root, {
    updateParentIds: false,
    promoteSingleRuleGroups: false,
    removeEmptyGroups: false,
    removeFailedValidations: false,
  });

  expect(group.parentId).not.toBe(root.id);
  expect(rule.parentId).not.toBe(group.id);
});
