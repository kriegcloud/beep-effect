import { EntityId } from "@beep/logos";
import { createRootGroup } from "@beep/logos/createRootGroup";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { expect, test } from "vitest";

test("root group is created", () => {
  const root = createRootGroup({ logicalOp: "and" });
  expect(root.entity).toBe("root");
  expect(root.rules.length).toBe(0);
  expect(S.decodeOption(EntityId)(root.id).pipe(O.isSome)).toBeTruthy();
  expect(root.logicalOp).toBe("and");
});
