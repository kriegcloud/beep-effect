import { assertSchemaArbitraryDecodesToSelf } from "@beep/test-utils";
import { describe, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("schema test helpers", () => {
  it("asserts that schema-derived arbitrary values decode to themselves", () => {
    assertSchemaArbitraryDecodesToSelf(S.Literal("ready"), { numRuns: 5 });
  });
});
