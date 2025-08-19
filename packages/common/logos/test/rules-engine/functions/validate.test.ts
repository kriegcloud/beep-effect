import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { validate } from "@beep/logos/rules-engine/functions/validate";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";

test("rules engine passes validation", () => {
  const root = createRoot({ combinator: "and" });
  addUnionToUnion(root, { combinator: "and" });
  addRuleToUnion(root, {
    field: "number",
    operator: "is_greater_than",
    _tag: "number",
    value: 18,
  });

  const result = validate(root);
  expect(result.isValid).toBeTruthy();
});

test("rules engine validation fails validation with invalid union", () => {
  const root = createRoot({ combinator: "and" });

  root.rules.push({
    entity: "union",
    id: uuidv4(),
    // @ts-expect-error
    combinator: "neither",
    parentId: root.id,
    rules: [],
  });

  const result = validate(root);
  expect(result.isValid).toBeFalsy();
  expect(!result.isValid && result.reason).toBeTruthy();
});

test("rules engine validation fails validation with invalid rule", () => {
  const root = createRoot({ combinator: "and" });

  root.rules.push({
    entity: "rule",
    id: uuidv4(),
    field: "number",
    operator: "is_greater_than",
    // @ts-expect-error
    _tag: "integer",
    value: 18,
    parentId: root.id,
  });

  const result = validate(root);
  expect(result.isValid).toBeFalsy();
  expect(!result.isValid && result.reason).toBeTruthy();
});
