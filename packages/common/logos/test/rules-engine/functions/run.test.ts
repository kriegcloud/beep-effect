import { createRoot } from "@beep/logos/createRoot";
import { addRuleToUnion, addUnionToUnion } from "@beep/logos/crud";
import { run } from "@beep/logos/run";
import { expect, test } from "vitest";

const root = createRoot({ logicalOp: "and" });

const union = addUnionToUnion(root, { logicalOp: "and" });
const firstRule = addRuleToUnion(union, {
  field: "number",
  op: { _tag: "gt" },
  _tag: "number",
  value: 18,
});
addRuleToUnion(union, {
  field: "number",
  op: { _tag: "lt" },
  _tag: "number",
  value: 30,
});
addRuleToUnion(root, {
  field: "string",
  op: { _tag: "in" },
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "boolean",
  op: {
    _tag: "isTrue",
  },
  _tag: "boolean",
});
addRuleToUnion(root, {
  field: "array",
  op: { _tag: "in" },
  _tag: "arrayValue",
  value: "alice",
});
addRuleToUnion(root, {
  field: "array",
  op: { _tag: "eq" },
  _tag: "arrayLength",
  value: 1,
});
addRuleToUnion(root, {
  field: "object",
  op: { _tag: "in" },
  _tag: "objectKey",
  value: "name",
});
addRuleToUnion(root, {
  field: "object",
  op: { _tag: "in" },
  _tag: "objectValue",
  value: "bob",
});
addRuleToUnion(root, {
  field: "object",
  op: { _tag: "in" },
  _tag: "objectKeyValue",
  value: { key: "name", value: "bob" },
});
addRuleToUnion(root, {
  field: "generic",
  op: { _tag: "eq" },
  _tag: "genericComparison",
  value: "bob",
});
addRuleToUnion(root, {
  field: "generic",
  op: { _tag: "isTruthy" },
  _tag: "genericType",
});
const orUnion = addUnionToUnion(root, { logicalOp: "or" });
addRuleToUnion(orUnion, {
  field: "number",
  op: { _tag: "lt" },
  _tag: "number",
  value: 30,
});
addRuleToUnion(orUnion, {
  field: "string",
  op: { _tag: "in" },
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});

test("rules engine passes", () => {
  const result = run(root, {
    string: "bob",
    boolean: true,
    number: 20,
    array: ["alice"],
    object: { name: "bob" },
    generic: "bob",
  });
  expect(result).toBeTruthy();
});

test("rules engine fails", () => {
  (root as any).logicalOp = "and";
  const result = run(root, {
    string: "bob",
    boolean: true,
    number: 20,
    array: ["alice"],
    object: { name: "bob" },
    generic: "bobby",
  });
  expect(result).toBeFalsy();
});

test("test invalid rule", () => {
  const invalidRule = { ...firstRule };
  // @ts-expect-error
  delete invalidRule.id;

  root.rules.splice(0, 1, invalidRule);
  expect(() => run(root, {})).toThrowError();
  root.rules.splice(0, 1, firstRule);
});

test("test no rules available", () => {
  const noRuleRoot = createRoot({ logicalOp: "and" });
  const result = run(noRuleRoot, {});
  expect(result).toBeTruthy();
});
