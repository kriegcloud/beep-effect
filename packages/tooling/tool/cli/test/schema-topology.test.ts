import { collectSchemaTopologyViolations } from "@beep/repo-cli/commands/Lint";
import { NodeServices } from "@effect/platform-node";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

describe("schema topology lint", () => {
  it("keeps @beep/schema on the canonical topology", () =>
    Effect.runPromise(
      collectSchemaTopologyViolations().pipe(
        Effect.provide(NodeServices.layer),
        Effect.map((violations) => {
          expect(violations).toEqual([]);
        })
      )
    ));
});
