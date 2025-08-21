import type { RuleInput, UnionInput } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import { addManyToUnion } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("rule and a union is added to a union", () => {
  const root = createRoot({ logicalOp: "and" });
  const newUnion: UnionInput.Type = {
    logicalOp: "and",
  };
  const newRule: RuleInput.Type = {
    field: "name",
    op: {
      _tag: "in",
    },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  };
  const rulesOrUnions = addManyToUnion(root, [newUnion, newRule]);
  expect(root.rules.length).toBe(2);
  rulesOrUnions.forEach((rule, index) => {
    expect(root.rules[index]).toBe(rule);
    expect(rule.parentId).toBe(root.id);
  });
  expect(rulesOrUnions[0]?.entity === "union");
  expect(rulesOrUnions[1]?.entity === "rule");
});
