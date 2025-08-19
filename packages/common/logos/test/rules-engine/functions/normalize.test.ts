import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { normalize } from "@beep/logos/rules-engine/functions/normalize";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";

test("normalization removes an invalid rule", () => {
  const root = createRoot({ combinator: "or" });

  const rule = addRuleToUnion(root, {
    field: "name",
    operator: "contains",
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
  const root = createRoot({ combinator: "or" });

  const rule = addRuleToUnion(root, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  rule.parentId = uuidv4();

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
  const root = createRoot({ combinator: "or" });

  const union = addUnionToUnion(root, { combinator: "and" });
  addRuleToUnion(union, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  // @ts-expect-error
  union.combinator = "invalid";

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization removes an union with no rules", () => {
  const root = createRoot({ combinator: "or" });
  addUnionToUnion(root, { combinator: "and" });

  expect(root.rules).toHaveLength(1);
  normalize(root);
  expect(root.rules).toHaveLength(0);
});

test("normalization promotes union with 1 rule to parent level", () => {
  const root = createRoot({ combinator: "or" });
  addRuleToUnion(root, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  const union = addUnionToUnion(root, { combinator: "and" });
  const rule = addRuleToUnion(union, {
    field: "name",
    operator: "contains",
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
  const root = createRoot({ combinator: "or" });
  addRuleToUnion(root, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  const union = addUnionToUnion(root, { combinator: "and" });
  addRuleToUnion(union, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  });
  addRuleToUnion(union, {
    field: "age",
    operator: "is_greater_than",
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
  const root = createRoot({ combinator: "or" });
  addRuleToUnion(root, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  const union = addUnionToUnion(root, { combinator: "and" });
  const rule = addRuleToUnion(union, {
    field: "name",
    operator: "contains",
    _tag: "string",
    value: "alice",
    ignoreCase: false,
  });
  addRuleToUnion(union, {
    field: "age",
    operator: "is_greater_than",
    _tag: "number",
    value: 18,
  });

  expect(union.parentId).toBe(root.id);
  expect(rule.parentId).toBe(union.id);

  union.parentId = uuidv4();
  rule.parentId = uuidv4();

  normalize(root, {
    update_parent_ids: false,
    promote_single_rule_unions: false,
    remove_empty_unions: false,
    remove_failed_validations: false,
  });

  expect(union.parentId).not.toBe(root.id);
  expect(rule.parentId).not.toBe(union.id);
});
