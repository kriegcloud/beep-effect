import { addUnionToUnion } from "@beep/logos/rules-engine/functions/add-union-to-union";
import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { NewUnion } from "@beep/logos/rules-engine/schema";
import { expect, test } from "vitest";

test("union is added to a union", () => {
  const root = createRoot({ combinator: "and" });
  const newUnion: NewUnion = {
    combinator: "and",
  };
  const union = addUnionToUnion(root, newUnion);
  expect(root.rules.length).toBe(1);
  expect(root.rules[0]).toBe(union);
  expect(union.parentId).toBe(root.id);
});
