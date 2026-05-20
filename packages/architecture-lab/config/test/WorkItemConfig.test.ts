import { WorkItemConfig } from "@beep/architecture-lab-config/layer";
import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/test";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("WorkItem configuration", () => {
  it.effect(
    "provides client-safe and server configuration",
    Effect.fnUntraced(function* () {
      const config = yield* WorkItemConfig;
      expect(config.publicConfig.assignmentEnabled).toBe(true);
      expect(config.serverConfig.migrationSchemaName).toBe("architecture_lab");
    }, provideScopedLayer(ArchitectureLabConfigTest))
  );
});
