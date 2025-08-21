import type { UnionInput } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import { addUnionsToUnion } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("unions are added to a union", () => {
  const root = createRoot({ logicalOp: "and" });
  const newUnionA: UnionInput.Type = {
    logicalOp: "and",
  };
  const newUnionB: UnionInput.Type = {
    logicalOp: "or",
  };
  expect(root.rules.length).toBe(0);
  const rules = addUnionsToUnion(root, [newUnionA, newUnionB]);
  expect(root.rules.length).toBe(2);
  rules.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
});
