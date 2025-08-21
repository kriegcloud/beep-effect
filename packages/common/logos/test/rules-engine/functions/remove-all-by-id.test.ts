import { createRoot } from "@beep/logos/createRoot";
import {
  addRuleToUnion,
  addUnionToUnion,
  removeAllById,
} from "@beep/logos/crud";

import { v4 as uuid } from "uuid";
import { expect, test } from "vitest";

test("remove many deeply nested union", () => {
  const root = createRoot({ logicalOp: "and" });
  const union = addUnionToUnion(root, { logicalOp: "and" });
  const deepUnion = addUnionToUnion(union, { logicalOp: "and" });
  addRuleToUnion(deepUnion, {
    field: "name",
    op: { _tag: "in" },
    _tag: "string",
    value: "bob",
    ignoreCase: false,
  });
  const deeperUnion = addUnionToUnion(deepUnion, { logicalOp: "and" });

  deepUnion.rules.push(deeperUnion);
  deepUnion.rules.push(deeperUnion);
  deepUnion.rules.push(deeperUnion);

  expect(deepUnion.rules).toContain(deeperUnion);
  expect(deepUnion.rules.length).toBe(5);

  removeAllById(root, deeperUnion.id);

  expect(deepUnion.rules).not.toContain(deepUnion);
  expect(deepUnion.rules.length).toBe(1);
});

test("remove non existent id", () => {
  const root = createRoot({ logicalOp: "and" });
  const union = addUnionToUnion(root, { logicalOp: "and" });

  expect(root.rules).toContain(union);
  expect(root.rules.length).toBe(1);

  removeAllById(root, uuid());

  expect(root.rules).toContain(union);
  expect(root.rules.length).toBe(1);
});
