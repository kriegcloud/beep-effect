import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { findRuleById } from "@beep/logos/rules-engine/functions/find-rule-by-id";
import { updateRuleById } from "@beep/logos/rules-engine/functions/update-rule-by-id";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";

const root = createRoot({ combinator: "or" });
addRuleToUnion(root, {
  field: "name",
  operator: "contains",
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "name",
  operator: "contains",
  _tag: "string",
  value: "alice",
  ignoreCase: false,
});
const union = addUnionToUnion(root, { combinator: "and" });
addRuleToUnion(union, {
  field: "age",
  operator: "is_greater_than",
  _tag: "number",
  value: 18,
});
const rule = addRuleToUnion(union, {
  field: "age",
  operator: "is_less_than",
  _tag: "number",
  value: 30,
});

test("update a rule that exists", () => {
  const foundRule = findRuleById(root, rule.id);
  if (!foundRule) {
    throw new Error("Rule not found");
  }
  if (foundRule._tag !== "number") {
    throw new Error("Rule type is not number");
  }
  expect(foundRule.value).toBe(30);
  updateRuleById(root, foundRule.id, {
    field: "age",
    operator: "is_less_than",
    _tag: "number",
    value: 40,
  });
  const updatedRule = findRuleById(root, rule.id);
  if (!updatedRule) {
    throw new Error("Rule not found");
  }
  if (updatedRule._tag !== "number") {
    throw new Error("Rule type is not number");
  }
  expect(updatedRule.value).toBe(40);
});

test("update a rule that does not exist", () => {
  const updatedRule = updateRuleById(root, uuidv4(), {
    field: "age",
    operator: "is_less_than",
    _tag: "number",
    value: 40,
  });
  expect(updatedRule).toBeUndefined();
});

test("update a rule that does not have a valid parent", () => {
  const foundRule = findRuleById(root, rule.id);
  if (!foundRule) {
    throw new Error("Rule not found");
  }
  foundRule.parentId = uuidv4();
  const updatedRule = updateRuleById(root, rule.id, {
    field: "age",
    operator: "is_less_than",
    _tag: "number",
    value: 40,
  });
  expect(updatedRule).toBeUndefined();
});
