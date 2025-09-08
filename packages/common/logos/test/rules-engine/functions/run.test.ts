import { RootGroup } from "@beep/logos";
import { addGroup, addRuleToGroup } from "@beep/logos/crud";
import { run } from "@beep/logos/run";
import type { UnsafeTypes } from "@beep/types";
import { expect, test } from "vitest";

const root = RootGroup.make({ logicalOp: "and" });

const group = addGroup(root, { logicalOp: "and" });
const firstRule = addRuleToGroup(group, {
  field: "number",
  op: { _tag: "gt" },
  type: "number",
  value: 18,
});
addRuleToGroup(group, {
  field: "number",
  op: { _tag: "lt" },
  type: "number",
  value: 30,
});
addRuleToGroup(root, {
  field: "string",
  op: { _tag: "stringContains" },
  type: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToGroup(root, {
  field: "boolean",
  op: {
    _tag: "isTrue",
  },
  type: "boolean",
});
addRuleToGroup(root, {
  field: "array",
  op: { _tag: "arrayContains" },
  type: "arrayValue",
  value: "alice",
});
addRuleToGroup(root, {
  field: "array",
  op: { _tag: "eq" },
  type: "arrayLength",
  value: 1,
});
addRuleToGroup(root, {
  field: "object",
  op: { _tag: "arrayContains" },
  type: "hasKey",
  value: "name",
});
addRuleToGroup(root, {
  field: "object",
  op: { _tag: "arrayContains" },
  type: "hasValue",
  value: "bob",
});
addRuleToGroup(root, {
  field: "object",
  op: { _tag: "arrayContains" },
  type: "hasEntry",
  value: { key: "name", value: "bob" },
});
addRuleToGroup(root, {
  field: "generic",
  op: { _tag: "eq" },
  type: "genericComparison",
  value: "bob",
});
addRuleToGroup(root, {
  field: "generic",
  op: { _tag: "isTruthy" },
  type: "genericType",
});
const orGroup = addGroup(root, { logicalOp: "or" });
addRuleToGroup(orGroup, {
  field: "number",
  op: { _tag: "lt" },
  type: "number",
  value: 30,
});
addRuleToGroup(orGroup, {
  field: "string",
  op: { _tag: "stringContains" },
  type: "string",
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
  (root as UnsafeTypes.UnsafeAny).logicalOp = "and";
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
  const noRuleRoot = RootGroup.make({ logicalOp: "and" });
  const result = run(noRuleRoot, {});
  expect(result).toBeTruthy();
});
