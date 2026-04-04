#!/usr/bin/env node

/**
 * CLI entry point - assembles runtime layers and executes the root command.
 *
 * @module
 * @internal
 * @since 0.0.0
 */

import { FsUtilsLive, TSMorphServiceLive } from "@beep/repo-utils";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { Command } from "effect/unstable/cli";
import { FetchHttpClient } from "effect/unstable/http";
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
const BaseLayers = Layer.mergeAll(NodeServices.layer);

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
const DerivedLayers = Layer.mergeAll(
  NodeChildProcessSpawner.layer,
  FetchHttpClient.layer,
  FsUtilsLive,
  TSMorphServiceLive
).pipe(Layer.provideMerge(BaseLayers));

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
const program = Effect.scoped(
  Layer.build(DerivedLayers).pipe(
    Effect.flatMap((context) => Command.run(rootCommand, { version: "0.0.0" }).pipe(Effect.provide(context)))
  )
);

Effect.runPromise(program).catch((err) => {
  console.error(err);
  process.exit(1);
});
// bench
