import type { GroupInput } from "@beep/logos";
import { RootGroup } from "@beep/logos";
import { addGroupToRoot } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("group is added to a group", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const newGroup: GroupInput.Type = {
    logicalOp: "and",
  };
  const group = addGroupToRoot(root, newGroup);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(group);
  expect(group.parentId).toBe(root.id);
});
