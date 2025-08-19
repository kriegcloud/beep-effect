import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { NewRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("rule is added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newRule: NewRule = {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const rule = addRuleToUnion(root, newRule);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(rule);
  expect(rule.parentId).toBe(root.id);
});
