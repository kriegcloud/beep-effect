import { addRuleToUnion, addUnionToUnion, createRoot } from "@beep/logos";

export function buildSampleRoot() {
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

  return { root, firstRule } as const;
}
