import { EntityId } from "@beep/logos";
import { createRoot } from "@beep/logos/createRoot";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { expect, test } from "vitest";

test("root union is created", () => {
  const root = createRoot({ logicalOp: "and" });
  expect(root.entity).toBe("rootUnion");
  expect(root.rules.length).toBe(0);
  expect(S.decodeOption(EntityId)(root.id).pipe(O.isSome)).toBeTruthy();
  expect(root.logicalOp).toBe("and");
});
