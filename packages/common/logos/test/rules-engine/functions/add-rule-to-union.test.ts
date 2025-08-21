import type { RuleInput } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import { addRuleToUnion } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("rule is added to a union", () => {
  const root = createRoot({ logicalOp: "and" });
  const newRule: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "in",
    },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const rule = addRuleToUnion(root, newRule);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(rule);
  expect(rule.parentId).toBe(root.id);
});
