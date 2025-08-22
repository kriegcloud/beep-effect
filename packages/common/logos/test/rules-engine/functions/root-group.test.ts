import { NodeId } from "@beep/logos";
import { RootGroup } from "@beep/logos/groups";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { expect, test } from "vitest";

test("root group is created", () => {
  const root = RootGroup.make({ logicalOp: "and" });
  expect(root.node).toBe("root");
  expect(root.rules.length).toBe(0);
  expect(S.decodeOption(NodeId)(root.id).pipe(O.isSome)).toBeTruthy();
  expect(root.logicalOp).toBe("and");
});
