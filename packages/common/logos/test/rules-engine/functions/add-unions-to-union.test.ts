import { addUnionsToUnion } from "@beep/logos/rules-engine/functions/add-unions-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import type { NewUnion } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("unions are added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newUnionA: NewUnion = {
    combinator: "and",
  };
  const newUnionB: NewUnion = {
    combinator: "or",
  };
  expect(root.rules.length).toBe(0);
  const rules = addUnionsToUnion(root, [newUnionA, newUnionB]);
  expect(root.rules.length).toBe(2);
  rules.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
});
