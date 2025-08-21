import { createRoot } from "@beep/logos/createRoot";
import {
  addRuleToUnion,
  addUnionToUnion,
  findRuleById,
  updateRuleById,
} from "@beep/logos/crud";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

const root = createRoot({ logicalOp: "or" });
addRuleToUnion(root, {
  field: "name",
  op: { _tag: "in" },
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "name",
  op: { _tag: "in" },
  _tag: "string",
  value: "alice",
  ignoreCase: false,
});
const union = addUnionToUnion(root, { logicalOp: "and" });
addRuleToUnion(union, {
  field: "age",
  op: { _tag: "gt" },
  _tag: "number",
  value: 18,
});
const rule = addRuleToUnion(union, {
  field: "age",
  op: { _tag: "lt" },
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
    op: { _tag: "lt" },
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
  const updatedRule = updateRuleById(root, uuid(), {
    field: "age",
    op: { _tag: "lt" },
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
  (foundRule as any).parentId = uuid();
  const updatedRule = updateRuleById(root, rule.id, {
    field: "age",
    op: { _tag: "lt" },
    _tag: "number",
    value: 40,
  });
  expect(updatedRule).toBeUndefined();
});
