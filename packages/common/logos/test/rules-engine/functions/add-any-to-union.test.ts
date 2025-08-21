import type { RuleInput, UnionInput } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import { addAnyToUnion } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("union is added to a union", () => {
  const root = createRoot({ logicalOp: "and" });
  const newUnion: UnionInput.Type = {
    logicalOp: "and",
  };
  const union = addAnyToUnion(root, newUnion);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(union);
  expect(union.parentId).toBe(root.id);
});

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
  const rule = addAnyToUnion(root, newRule);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(rule);
  expect(rule.parentId).toBe(root.id);
});
