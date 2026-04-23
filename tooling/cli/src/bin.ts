#!/usr/bin/env bun

/**
 * CLI entry point - assembles runtime layers and executes the root command.
 *
 * @module
 * @internal
 * @since 0.0.0
 */

import { FsUtilsLive, TSMorphServiceLive } from "@beep/repo-utils";
import { BunChildProcessSpawner, BunHttpClient, BunRuntime, BunServices } from "@effect/platform-bun";
import { Cause, Effect, Layer } from "effect";
import * as O from "effect/Option";
import { Command } from "effect/unstable/cli";
import { parseQualityTaskInvocation, runQualityTask } from "./commands/Quality/Tasks.js";
import { rootCommand } from "./commands/Root.js";

/**
 * Foundation layer providing Node.js implementations of FileSystem, Path, and Terminal.
 *
 * These three services are leaf dependencies required by virtually every CLI
 * command and are combined here so they can be shared by all derived layers.
 *
 * @internal
 * @category Configuration
 * @since 0.0.0
 */
const BaseLayers = Layer.mergeAll(BunServices.layer, BunHttpClient.layer);

/**
 * Minimal runtime required for quality-task fast path.
 *
 * Keeps startup lean when dispatching build/check/test/lint/audit adapters.
 *
 * @internal
 * @category Configuration
 * @since 0.0.0
 */
const QualityLayers = Layer.mergeAll(BunChildProcessSpawner.layer).pipe(Layer.provideMerge(BaseLayers));

/**
 * Fully assembled runtime layer that merges higher-level services
 * (ChildProcessSpawner, FsUtils) on top of the {@link BaseLayers}.
 *
 * This layer satisfies all `Command.Environment` requirements plus
 * the repo-utils `FsUtils` service used by commands like `codegen`.
 *
 * @internal
 * @category Configuration
 * @since 0.0.0
 */
const DerivedLayers = Layer.mergeAll(BunChildProcessSpawner.layer, FsUtilsLive, TSMorphServiceLive).pipe(
  Layer.provideMerge(BaseLayers)
);

const argv = process.argv.slice(2);
const qualityTaskInvocation = parseQualityTaskInvocation(argv);

/**
 * Top-level CLI program effect produced by running the root command tree
 * with the fully-resolved {@link DerivedLayers}.
 *
 * This is the value handed to `Effect.runPromise` to execute the CLI.
 *
 * @internal
 * @category UseCase
 * @since 0.0.0
 */
if (O.isSome(qualityTaskInvocation)) {
  const qualityProgram = Effect.scoped(
    Layer.build(QualityLayers).pipe(
      Effect.flatMap(
        Effect.fnUntraced(function* (context) {
          return yield* runQualityTask(qualityTaskInvocation.value).pipe(Effect.provide(context));
        })
      )
    )
  ).pipe(
    Effect.catchCause((cause) =>
      Effect.sync(() => {
        process.exitCode = 1;
        console.error(Cause.pretty(cause));
      })
    )
  );
  BunRuntime.runMain(qualityProgram);
} else {
  const commandProgram = Effect.scoped(
    Layer.build(DerivedLayers).pipe(
      Effect.flatMap(
        Effect.fnUntraced(function* (context) {
          return yield* Command.run(rootCommand, { version: "0.0.0" }).pipe(Effect.provide(context));
        })
      )
    )
  ).pipe(
    Effect.catchCause((cause) =>
      Effect.sync(() => {
        process.exitCode = 1;
        console.error(Cause.pretty(cause));
      })
    )
  );
  BunRuntime.runMain(commandProgram);
}
// bench
