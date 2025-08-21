import type { UnionInput } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import { addUnionToUnion } from "@beep/logos/crud";
import { expect, test } from "vitest";

test("union is added to a union", () => {
  const root = createRoot({ logicalOp: "and" });
  const newUnion: UnionInput.Type = {
    logicalOp: "and",
  };
  const union = addUnionToUnion(root, newUnion);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(union);
  expect(union.parentId).toBe(root.id);
});
