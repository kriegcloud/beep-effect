import { collectSchemaTopologyViolations } from "@beep/repo-cli/commands/Lint";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("schema topology lint", () => {
  it("keeps @beep/schema on the canonical topology", () =>
    Effect.runPromise(
      collectSchemaTopologyViolations().pipe(
        provideScopedLayer(NodeServices.layer),
        Effect.map((violations) => {
          expect(violations).toEqual([]);
        })
      )
    ));
});
