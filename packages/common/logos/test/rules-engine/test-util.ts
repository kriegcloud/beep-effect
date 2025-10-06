import { addGroup, addRuleToGroup, RootGroup } from "@beep/logos";

export function buildSampleRoot() {
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

  return { root, firstRule } as const;
}
