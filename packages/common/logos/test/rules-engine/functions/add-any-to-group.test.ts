import type { GroupInput, RuleInput } from "@beep/logos";
import { RootGroup } from "@beep/logos";
import { addAnyToGroup } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("group is added to a group", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const newGroup: GroupInput.Type = {
    logicalOp: "and",
  };
  const group = addAnyToGroup(root, newGroup);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(group);
  expect(group.parentId).toBe(root.id);
});

test("rule is added to a group", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const newRule: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "stringContains",
    },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const rule = addAnyToGroup(root, newRule);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(rule);
  expect(rule.parentId).toBe(root.id);
});
