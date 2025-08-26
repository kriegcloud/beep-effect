import type { GroupInput, RuleInput } from "@beep/logos";
import { RootGroup } from "@beep/logos";
import { addManyToGroup } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("rule and a group is added to a group", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const newGroup: GroupInput.Type = {
    logicalOp: "and",
  };
  const newRule: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "stringContains",
    },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const rulesOrGroups = addManyToGroup(root, [newGroup, newRule]);
  expect(root.rules.length).toBe(2);
  rulesOrGroups.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
  expect(rulesOrGroups[0]?.node === "group");
  expect(rulesOrGroups[1]?.node === "rule");
});
