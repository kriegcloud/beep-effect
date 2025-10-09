import { expect, test } from "bun:test";
import type { RuleInput } from "@beep/logos";
import { RootGroup } from "@beep/logos";
import { addRuleToGroup } from "@beep/logos/crud";

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
  const rule = addRuleToGroup(root, newRule);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(rule);
  expect(rule.parentId).toBe(root.id);
});
