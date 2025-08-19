import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { removeAllById } from "@beep/logos/rules-engine/functions/remove-all-by-id";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";

test("remove many deeply nested union", () => {
  const root = createRoot({ combinator: "and" });
  const union = addUnionToUnion(root, { combinator: "and" });
  const deepUnion = addUnionToUnion(union, { combinator: "and" });
  addRuleToUnion(deepUnion, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  const deeperUnion = addUnionToUnion(deepUnion, { combinator: "and" });

  deepUnion.rules.push(deeperUnion);
  deepUnion.rules.push(deeperUnion);
  deepUnion.rules.push(deeperUnion);

  expect(deepUnion.rules).toContain(deeperUnion);
  expect(deepUnion.rules.length).toBe(5);

  removeAllById(root, deeperUnion.id);

  expect(deepUnion.rules).not.toContain(deepUnion);
  expect(deepUnion.rules.length).toBe(1);
});

test("remove non existent id", () => {
  const root = createRoot({ combinator: "and" });
  const union = addUnionToUnion(root, { combinator: "and" });

  expect(root.rules).toContain(union);
  expect(root.rules.length).toBe(1);

  removeAllById(root, uuidv4());

  expect(root.rules).toContain(union);
  expect(root.rules.length).toBe(1);
});
