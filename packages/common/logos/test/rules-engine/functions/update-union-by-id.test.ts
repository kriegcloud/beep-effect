import { addRuleToUnion } from "@beep/logos/rules-engine/functions/add-rule-to-union";
import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { findUnionById } from "@beep/logos/rules-engine/functions/find-union-by-id";
import { updateUnionById } from "@beep/logos/rules-engine/functions/update-union-by-id";
import { v4 as uuidv4 } from "uuid";
import { expect, test } from "vitest";

const root = createRoot({ combinator: "or" });
addRuleToUnion(root, {
  field: "name",
  operator: "contains",
  _tag: "string",
  value: "bob",
  ignoreCase: false,
});
addRuleToUnion(root, {
  field: "name",
  operator: "contains",
  _tag: "string",
  value: "alice",
  ignoreCase: false,
});
const union = addUnionToUnion(root, { combinator: "and" });

test("update a union that exists", () => {
  const foundUnion = findUnionById(root, union.id);
  if (!foundUnion) {
    throw new Error("Union not found");
  }
  expect(foundUnion.combinator).toBe("and");
  updateUnionById(root, foundUnion.id, { combinator: "or" });
  const updatedUnion = findUnionById(root, union.id);
  if (!updatedUnion) {
    throw new Error("Union not found");
  }
  expect(updatedUnion.combinator).toBe("or");
});

test("update a root union", () => {
  const foundUnion = findUnionById(root, root.id);
  if (!foundUnion) {
    throw new Error("Union not found");
  }
  expect(foundUnion.combinator).toBe("or");
  updateUnionById(root, foundUnion.id, { combinator: "and" });
  const updatedUnion = findUnionById(root, root.id);
  if (!updatedUnion) {
    throw new Error("Union not found");
  }
  expect(updatedUnion.combinator).toBe("and");
});

test("update a union that does not exist", () => {
  const updatedUnion = updateUnionById(root, uuidv4(), { combinator: "or" });
  expect(updatedUnion).toBeUndefined();
});

test("update a union that does not have a valid parent", () => {
  const foundUnion = findUnionById(root, union.id);
  if (!foundUnion) {
    throw new Error("Union not found");
  }
  if (foundUnion.entity === "root_union") {
    throw new Error("Union is not the correct type");
  }
  foundUnion.parentId = uuidv4();
  const updatedUnion = updateUnionById(root, union.id, { combinator: "or" });
  expect(updatedUnion).toBeUndefined();
});
