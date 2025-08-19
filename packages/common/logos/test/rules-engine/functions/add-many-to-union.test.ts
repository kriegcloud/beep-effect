import { addManyToUnion } from "@beep/logos/rules-engine/functions/add-many-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { NewRule, NewUnion } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("rule and a union is added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newUnion: NewUnion = {
    combinator: "and",
  };
  const newRule: NewRule = {
    field: "name",
    operator: "contains",
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
