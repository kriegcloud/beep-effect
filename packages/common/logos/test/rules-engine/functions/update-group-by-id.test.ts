import { RootGroup } from "@beep/logos";
import {
  addGroup,
  addRuleToGroup,
  findGroupById,
  updateGroupById,
} from "@beep/logos/crud";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

const root = RootGroup.make({ logicalOp: "or" });
addRuleToGroup(root, {
  type: "string",
  field: "name",
  op: { _tag: "stringContains" },
  value: "bob",
  ignoreCase: false,
});
addRuleToGroup(root, {
  type: "string",
  field: "name",
  op: { _tag: "stringContains" },
  value: "alice",
  ignoreCase: false,
});
const group = addGroup(root, { logicalOp: "and" });

test("update a group that exists", () => {
  const foundGroup = findGroupById(root, group.id);
  if (!foundGroup) {
    throw new Error("Group not found");
  }
  expect(foundGroup.logicalOp).toBe("and");
  updateGroupById(root, foundGroup.id, { logicalOp: "or" });
  const updatedGroup = findGroupById(root, group.id);
  if (!updatedGroup) {
    throw new Error("Group not found");
  }
  expect(updatedGroup.logicalOp).toBe("or");
});

test("update a root group", () => {
  const foundGroup = findGroupById(root, root.id);
  if (!foundGroup) {
    throw new Error("Group not found");
  }
  expect(foundGroup.logicalOp).toBe("or");
  updateGroupById(root, foundGroup.id, { logicalOp: "and" });
  const updatedGroup = findGroupById(root, root.id);
  if (!updatedGroup) {
    throw new Error("Group not found");
  }
  expect(updatedGroup.logicalOp).toBe("and");
});

test("update a group that does not exist", () => {
  const updatedGroup = updateGroupById(root, uuid(), { logicalOp: "or" });
  expect(updatedGroup).toBeUndefined();
});

test("update a group that does not have a valid parent", () => {
  const foundGroup = findGroupById(root, group.id);
  if (!foundGroup) {
    throw new Error("Group not found");
  }
  if (foundGroup.node === "root") {
    throw new Error("Group is not the correct type");
  }
  foundGroup.parentId = uuid();
  const updatedGroup = updateGroupById(root, group.id, { logicalOp: "or" });
  expect(updatedGroup).toBeUndefined();
});
