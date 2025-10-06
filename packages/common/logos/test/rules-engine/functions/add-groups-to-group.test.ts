import type { GroupInput } from "@beep/logos";
import { RootGroup } from "@beep/logos";
import { addGroups } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("groups are added to a group", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const newGroupA: GroupInput.Type = {
    logicalOp: "and",
  };
  const newGroupB: GroupInput.Type = {
    logicalOp: "or",
  };
  expect(root.rules.length).toBe(0);
  const rules = addGroups(root, [newGroupA, newGroupB]);
  expect(root.rules.length).toBe(2);
  rules.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
});
