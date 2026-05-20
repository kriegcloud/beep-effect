import { StackManifestServerLive } from "@beep/installer-server";
import { StackManifestUseCases } from "@beep/installer-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("Installer workspace dry-run server", () => {
  it.effect("provides a deterministic manifest snapshot", () =>
    Effect.gen(function* () {
      const workspace = yield* StackManifestUseCases;
      const plan = yield* workspace.previewWorkspace();

      expect(plan.snapshot.manifest.dryRunOnly).toBe(true);
      expect(A.map(plan.snapshot.manifest.providers, (provider) => provider.provider)).toEqual(["claude", "codex"]);
      expect(plan.snapshot.manifest.discordChannel.displayName).toBe("ai-stack-installer");
      expect(plan.snapshot.validationEvents).toHaveLength(4);
    }).pipe(provideScopedLayer(StackManifestServerLive))
  );
});
