import { addRulesToUnion } from "@beep/logos/rules-engine/functions/add-rules-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { NewRule } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("rules are added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newRuleA: NewRule = {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const newRuleB: NewRule = {
    field: "name",
    operator: "contains",
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
