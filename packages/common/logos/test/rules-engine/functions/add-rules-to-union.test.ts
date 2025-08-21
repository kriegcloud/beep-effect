import type { RuleInput } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import { addRulesToUnion } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("rules are added to a union", () => {
  const root = createRoot({ logicalOp: "and" });
  const newRuleA: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "in",
    },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const newRuleB: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "in",
    },
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  };
  expect(root.rules.length).toBe(0);
  const rules = addRulesToUnion(root, [newRuleA, newRuleB]);
  expect(root.rules.length).toBe(2);
  rules.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
});
