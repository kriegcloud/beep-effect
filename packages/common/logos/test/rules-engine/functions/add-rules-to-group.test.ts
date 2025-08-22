import type { RuleInput } from "@beep/logos";
import { createRootGroup } from "@beep/logos/createRootGroup";
import { addRulesToGroup } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("rules are added to a group", () => {
  const root = createRootGroup({ logicalOp: "and" });
  const newRuleA: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "in",
    },
    type: "string",
    value: "bob",
    ignoreCase: false,
  };
  const newRuleB: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "in",
    },
    type: "string",
    value: "alice",
    ignoreCase: false,
  };
  expect(root.rules.length).toBe(0);
  const rules = addRulesToGroup(root, [newRuleA, newRuleB]);
  expect(root.rules.length).toBe(2);
  rules.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
});
