import { createRoot } from "@beep/logos/createRoot";
import { addRuleToUnion, addUnionToUnion } from "@beep/logos/crud";
import { normalize } from "@beep/logos/normalize";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

test("normalization removes an invalid rule", () => {
  const root = createRoot({ logicalOp: "or" });

  const rule: any = addRuleToUnion(root, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  rule._tag = "number";

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization fixes the parent id of a rule", () => {
  const root = createRoot({ logicalOp: "or" });

  const rule: any = addRuleToUnion(root, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  rule.parentId = uuid();

  root.rules.forEach((rule) => {
    expect(rule.parentId).not.toBe(root.id);
  });
  expect(root.rules[0]?.parentId).not.toBe(root.id);
  normalize(root);
  root.rules.forEach((rule) => {
    expect(rule.parentId).toBe(root.id);
  });
});

test("normalization removes an invalid union", () => {
  const root = createRoot({ logicalOp: "or" });

  const union = addUnionToUnion(root, { logicalOp: "and" });
  addRuleToUnion(union, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  // @ts-expect-error
  union.logicalOp = "invalid";

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization removes an union with no rules", () => {
  const root = createRoot({ logicalOp: "or" });
  addUnionToUnion(root, { logicalOp: "and" });

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization promotes union with 1 rule to parent level", () => {
  const root = createRoot({ logicalOp: "or" });
  addRuleToUnion(root, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  const union = addUnionToUnion(root, { logicalOp: "and" });
  const rule = addRuleToUnion(union, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  });

  expect(root.rules[1]?.entity).toBe("union");
  expect(root.rules[1]?.id).toBe(union.id);

  normalize(root);

  expect(root.rules[1]?.entity).toBe("rule");
  expect(root.rules[1]?.id).toBe(rule.id);
});

test("normalization finds nothing wrong", () => {
  const root = createRoot({ logicalOp: "or" });
  addRuleToUnion(root, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  const union = addUnionToUnion(root, { logicalOp: "and" });
  addRuleToUnion(union, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  });
  addRuleToUnion(union, {
    field: "age",
    op: { _tag: "gt" },
    _tag: "number",
    value: 18,
  });

  expect(root.rules).toHaveLength(2);
  root.rules.forEach((rule) => {
    expect(rule.parentId).toBe(root.id);
  });

  normalize(root);

  expect(root.rules).toHaveLength(2);
  root.rules.forEach((rule) => {
    expect(rule.parentId).toBe(root.id);
  });
});

test("normalization has all options turn off", () => {
  const root = createRoot({ logicalOp: "or" });
  addRuleToUnion(root, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  const union = addUnionToUnion(root, { logicalOp: "and" });
  const rule: any = addRuleToUnion(union, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  });
  addRuleToUnion(union, {
    field: "age",
    op: { _tag: "gt" },
    _tag: "number",
    value: 18,
  });

  expect(union.parentId).toBe(root.id);
  expect(rule.parentId).toBe(union.id);

  union.parentId = uuid();
  rule.parentId = uuid();

  normalize(root, {
    updateParentIds: false,
    promoteSingleRuleUnions: false,
    removeEmptyUnions: false,
    removeFailedValidations: false,
  });

  expect(union.parentId).not.toBe(root.id);
  expect(rule.parentId).not.toBe(union.id);
});
