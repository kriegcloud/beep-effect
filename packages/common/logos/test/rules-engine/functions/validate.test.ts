import { RootGroup } from "@beep/logos";
import { addGroupToRoot, addRuleToGroup } from "@beep/logos/crud";
import { validate } from "@beep/logos/validate";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

test("rules engine passes validation", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  addGroupToRoot(root, { logicalOp: "and" });
  addRuleToGroup(root, {
    field: "number",
    op: { _tag: "gt" },
    type: "number",
    value: 18,
  });

  const result = validate(root);
  expect(result.isValid).toBeTruthy();
});

test("rules engine validation fails validation with invalid group", () => {
  const root = RootGroup.make({ logicalOp: "and" });

  root.rules.push({
    node: "group",
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
  const root = RootGroup.make({ logicalOp: "and" });

  root.rules.push({
    node: "rule",
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
