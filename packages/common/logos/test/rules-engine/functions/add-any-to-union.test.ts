import { addAnyToUnion } from "@beep/logos/rules-engine/functions/add-any-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import type { NewRule, NewUnion } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("union is added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newUnion: NewUnion = {
    combinator: "and",
  };
  const union = addAnyToUnion(root, newUnion);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(union);
  expect(union.parentId).toBe(root.id);
});

test("rule is added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newRule: NewRule = {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const rule = addAnyToUnion(root, newRule);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(rule);
  expect(rule.parentId).toBe(root.id);
});
