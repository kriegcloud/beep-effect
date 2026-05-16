import { runArchitectureLabProof } from "@beep/architecture-lab-proof";
import { ArchitectureLabServerLive } from "@beep/architecture-lab-server/layer";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("architecture lab proof app", () => {
  it.effect("runs through the composed app layer", () =>
    runArchitectureLabProof.pipe(
      provideScopedLayer(ArchitectureLabServerLive),
      Effect.map((result) => {
        expect(result.created.status).toBe("open");
        expect(result.summary.visibleActions).toContain("assign");
      })
    )
  );
});
