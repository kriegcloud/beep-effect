import { createRoot } from "@beep/logos/createRoot";
import { addRuleToUnion, addUnionToUnion } from "@beep/logos/crud";
import { validate } from "@beep/logos/validate";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

test("rules engine passes validation", () => {
  const root = createRoot({ logicalOp: "and" });
  addUnionToUnion(root, { logicalOp: "and" });
  addRuleToUnion(root, {
    field: "number",
    op: { _tag: "gt" },
    _tag: "number",
    value: 18,
  });

  const result = validate(root);
  expect(result.isValid).toBeTruthy();
});

test("rules engine validation fails validation with invalid union", () => {
  const root = createRoot({ logicalOp: "and" });

  root.rules.push({
    entity: "union",
    id: uuid(),
    // @ts-expect-error
    logicalOp: "neither",
    parentId: root.id,
    rules: [],
  });

  const result = validate(root);
  expect(result.isValid).toBeFalsy();
  expect(!result.isValid && result.reason).toBeTruthy();
});

test("rules engine validation fails validation with invalid rule", () => {
  const root = createRoot({ logicalOp: "and" });

  root.rules.push({
    entity: "rule",
    id: uuid(),
    field: "number",
    op: { _tag: "gt" },
    // @ts-expect-error
    _tag: "integer",
    value: 18,
    parentId: root.id,
  });

  const result = validate(root);
  expect(result.isValid).toBeFalsy();
  expect(!result.isValid && result.reason).toBeTruthy();
});
