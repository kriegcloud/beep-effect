import { createRoot } from "@beep/logos/createRoot";
import {
  addRuleToUnion,
  addUnionToUnion,
  findUnionById,
  updateUnionById,
} from "@beep/logos/crud";
import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

const root = createRoot({ logicalOp: "or" });
addRuleToUnion(root, {
  field: "name",
  op: { _tag: "in" },
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "name",
  op: { _tag: "in" },
  _tag: "string",
  value: "alice",
  ignoreCase: false,
});
const union = addUnionToUnion(root, { logicalOp: "and" });

test("update a union that exists", () => {
  const foundUnion = findUnionById(root, union.id);
  if (!foundUnion) {
    throw new Error("Union not found");
  }
  expect(foundUnion.logicalOp).toBe("and");
  updateUnionById(root, foundUnion.id, { logicalOp: "or" });
  const updatedUnion = findUnionById(root, union.id);
  if (!updatedUnion) {
    throw new Error("Union not found");
  }
  expect(updatedUnion.logicalOp).toBe("or");
});

test("update a root union", () => {
  const foundUnion = findUnionById(root, root.id);
  if (!foundUnion) {
    throw new Error("Union not found");
  }
  expect(foundUnion.logicalOp).toBe("or");
  updateUnionById(root, foundUnion.id, { logicalOp: "and" });
  const updatedUnion = findUnionById(root, root.id);
  if (!updatedUnion) {
    throw new Error("Union not found");
  }
  expect(updatedUnion.logicalOp).toBe("and");
});

test("update a union that does not exist", () => {
  const updatedUnion = updateUnionById(root, uuid(), { logicalOp: "or" });
  expect(updatedUnion).toBeUndefined();
});

test("update a union that does not have a valid parent", () => {
  const foundUnion = findUnionById(root, union.id);
  if (!foundUnion) {
    throw new Error("Union not found");
  }
  if (foundUnion.entity === "rootUnion") {
    throw new Error("Union is not the correct type");
  }
  foundUnion.parentId = uuid();
  const updatedUnion = updateUnionById(root, union.id, { logicalOp: "or" });
  expect(updatedUnion).toBeUndefined();
});
