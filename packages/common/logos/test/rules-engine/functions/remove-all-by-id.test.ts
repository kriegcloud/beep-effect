import { expect, test } from "bun:test";
import { RootGroup } from "@beep/logos";
import { addGroup, addRuleToGroup, removeAllById } from "@beep/logos/crud";
import { v4 as uuid } from "uuid";

test("remove many deeply nested group", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const group = addGroup(root, { logicalOp: "and" });
  const deepGroup = addGroup(group, { logicalOp: "and" });
  addRuleToGroup(deepGroup, {
    field: "name",
    op: { _tag: "stringContains" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });
  const deeperGroup = addGroup(deepGroup, { logicalOp: "and" });

  deepGroup.rules.push(deeperGroup);
  deepGroup.rules.push(deeperGroup);
  deepGroup.rules.push(deeperGroup);

  expect(deepGroup.rules).toContain(deeperGroup);
  expect(deepGroup.rules.length).toBe(5);

  removeAllById(root, deeperGroup.id);

  expect(deepGroup.rules).not.toContain(deepGroup);
  expect(deepGroup.rules.length).toBe(1);
});

test("remove non existent id", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  const group = addGroup(root, { logicalOp: "and" });

  expect(root.rules).toContain(group);
  expect(root.rules.length).toBe(1);

  removeAllById(root, uuid());

  expect(root.rules).toContain(group);
  expect(root.rules.length).toBe(1);
});
