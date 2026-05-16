/**
 * App-local Bun repair workflow.
 *
 * @packageDocumentation
 * @category workflows
 * @since 0.0.0
 */

import { BunCli } from "@beep/bun-cli";
import { makeInstallerDependenciesConfigLayer } from "@beep/installer-dependencies-config/layer";
import { InstallerDependenciesServerLive } from "@beep/installer-dependencies-server";
import {
  BunRuntimeHealthResult,
  BunRuntimeRepairRequest,
  BunRuntimeRepairResult,
} from "@beep/installer-dependencies-use-cases/public";
import { InstallerDependenciesUseCases } from "@beep/installer-dependencies-use-cases/server";
import { BunChildProcessSpawner, BunRuntime, BunServices } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer, pipe } from "effect";
import * as S from "effect/Schema";

const encodeBunRuntimeHealthResult = S.encodeUnknownEffect(S.fromJsonString(BunRuntimeHealthResult));
const encodeBunRuntimeRepairResult = S.encodeUnknownEffect(S.fromJsonString(BunRuntimeRepairResult));

const BaseLayer = Layer.mergeAll(BunServices.layer, BunFileSystem.layer, BunPath.layer);
const DriverLayer = BunCli.makeLayer().pipe(
  Layer.provideMerge(BunChildProcessSpawner.layer),
  Layer.provideMerge(BaseLayer)
);
const makeBunRuntimeRepairLayer = (repoRoot: string) =>
  InstallerDependenciesServerLive.pipe(
    Layer.provideMerge(DriverLayer),
    Layer.provideMerge(makeInstallerDependenciesConfigLayer(repoRoot)),
    Layer.provideMerge(BaseLayer)
  );

/**
 * Inspect Bun runtime health for the focused app-first repair flow.
 *
 * @category workflows
 * @since 0.0.0
 */
export const inspectBunRuntimeForApp = Effect.fn("StackInstaller.inspectBunRuntimeForApp")(function* () {
  const dependencies = yield* InstallerDependenciesUseCases;
  return yield* dependencies.inspectBunRuntime();
});

/**
 * Run the approval-first Bun repair flow for the app.
 *
 * @category workflows
 * @since 0.0.0
 */
export const repairBunRuntimeForApp = Effect.fn("StackInstaller.repairBunRuntimeForApp")(function* () {
  const dependencies = yield* InstallerDependenciesUseCases;
  return yield* dependencies.repairBunRuntime(
    new BunRuntimeRepairRequest({
      approved: true,
    })
  );
});

/**
 * Encode the Bun health result as JSON for the Tauri bridge.
 *
 * @category workflows
 * @since 0.0.0
 */
export const inspectBunRuntimeJson = Effect.fn("StackInstaller.inspectBunRuntimeJson")(function* () {
  const result = yield* inspectBunRuntimeForApp();
  return yield* encodeBunRuntimeHealthResult(result);
});

/**
 * Encode the Bun repair result as JSON for the Tauri bridge.
 *
 * @category workflows
 * @since 0.0.0
 */
export const repairBunRuntimeJson = Effect.fn("StackInstaller.repairBunRuntimeJson")(function* () {
  const result = yield* repairBunRuntimeForApp();
  return yield* encodeBunRuntimeRepairResult(result);
});

/**
 * Run the Bun repair CLI main entrypoint.
 *
 * @category workflows
 * @since 0.0.0
 */
export const runBunRuntimeRepairMain = (program: Effect.Effect<string, string>) =>
  BunRuntime.runMain(
    pipe(
      program,
      Effect.tap((encoded) =>
        Effect.sync(() => {
          console.log(encoded);
        })
      ),
      Effect.catch((message: string) =>
        Effect.sync(() => {
          console.error(message);
          process.exitCode = 1;
        })
      )
    )
  );

/**
 * Build the runtime layer for the Bun repair workflow.
 *
 * @category workflows
 * @since 0.0.0
 */
export const provideBunRuntimeRepairLayer = <A, E, R>(repoRoot: string, program: Effect.Effect<A, E, R>) =>
  program.pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(makeBunRuntimeRepairLayer(repoRoot))
  );
