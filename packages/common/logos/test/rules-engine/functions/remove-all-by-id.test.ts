import { createRootGroup } from "@beep/logos/createRootGroup";
import {
  addGroupToRoot,
  addRuleToGroup,
  removeAllById,
} from "@beep/logos/crud";

import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

test("remove many deeply nested group", () => {
  const root = createRootGroup({ logicalOp: "and" });
  const group = addGroupToRoot(root, { logicalOp: "and" });
  const deepGroup = addGroupToRoot(group, { logicalOp: "and" });
  addRuleToGroup(deepGroup, {
    field: "name",
    op: { _tag: "in" },
    type: "string",
    value: "bob",
    ignoreCase: false,
  });
  const deeperGroup = addGroupToRoot(deepGroup, { logicalOp: "and" });

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
  const root = createRootGroup({ logicalOp: "and" });
  const group = addGroupToRoot(root, { logicalOp: "and" });

  expect(root.rules).toContain(group);
  expect(root.rules.length).toBe(1);

  removeAllById(root, uuid());

  expect(root.rules).toContain(group);
  expect(root.rules.length).toBe(1);
});
