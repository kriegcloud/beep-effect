import * as l from "@beep/logos/v2";
import { describe, expect, test } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("RootGroup", () => {
  test("root group is created", () => {
    const root = l.RootGroup.make({
      logicalOp: "and",
    });
    expect(root.node).toBe("root");
    expect(root.rules.length).toBe(0);
    expect(S.decodeOption(l.NodeId)(root.id).pipe(O.isSome)).toBeTruthy();
    expect(root.logicalOp).toBe("and");
  });
});
