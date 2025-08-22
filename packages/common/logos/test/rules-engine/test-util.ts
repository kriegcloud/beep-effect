import { addGroupToRoot, addRuleToGroup, createRootGroup } from "@beep/logos";

export function buildSampleRoot() {
  const root = createRootGroup({ logicalOp: "and" });

  const group = addGroupToRoot(root, { logicalOp: "and" });
  const firstRule = addRuleToGroup(group, {
    field: "number",
    op: { _tag: "gt" },
    _tag: "number",
    value: 18,
  });
  addRuleToGroup(group, {
    field: "number",
    op: { _tag: "lt" },
    _tag: "number",
    value: 30,
  });
  addRuleToGroup(root, {
    field: "string",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  addRuleToGroup(root, {
    field: "boolean",
    op: {
      _tag: "isTrue",
    },
    _tag: "boolean",
  });
  addRuleToGroup(root, {
    field: "array",
    op: { _tag: "in" },
    _tag: "arrayValue",
    value: "alice",
  });
  addRuleToGroup(root, {
    field: "array",
    op: { _tag: "eq" },
    _tag: "arrayLength",
    value: 1,
  });
  addRuleToGroup(root, {
    field: "object",
    op: { _tag: "in" },
    _tag: "hasKey",
    value: "name",
  });
  addRuleToGroup(root, {
    field: "object",
    op: { _tag: "in" },
    _tag: "hasValue",
    value: "bob",
  });
  addRuleToGroup(root, {
    field: "object",
    op: { _tag: "in" },
    _tag: "hasEntry",
    value: { key: "name", value: "bob" },
  });
  addRuleToGroup(root, {
    field: "generic",
    op: { _tag: "eq" },
    _tag: "genericComparison",
    value: "bob",
  });
  addRuleToGroup(root, {
    field: "generic",
    op: { _tag: "isTruthy" },
    _tag: "genericType",
  });
  const orGroup = addGroupToRoot(root, { logicalOp: "or" });
  addRuleToGroup(orGroup, {
    field: "number",
    op: { _tag: "lt" },
    _tag: "number",
    value: 30,
  });
  addRuleToGroup(orGroup, {
    field: "string",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });

  return { root, firstRule } as const;
}
