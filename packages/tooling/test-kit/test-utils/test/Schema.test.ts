import { assertSchemaArbitraryDecodesToSelf } from "@beep/test-utils";
import { describe, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("schema test helpers", () => {
  it("asserts that schema-derived arbitrary values decode to themselves", () => {
    assertSchemaArbitraryDecodesToSelf(S.Literal("ready"), { numRuns: 5 });
  });

  it("supports object-valued class schemas", () => {
    class ExamplePayload extends S.Class<ExamplePayload>("ExamplePayload")({
      count: S.Literal(1),
      status: S.Literal("ready"),
    }) {}

    assertSchemaArbitraryDecodesToSelf(ExamplePayload, { numRuns: 5 });
  });
});
