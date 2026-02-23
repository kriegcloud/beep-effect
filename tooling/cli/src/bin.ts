#!/usr/bin/env node

/**
 * CLI entry point - assembles runtime layers and executes the root command.
 *
 * @since 0.0.0
 * @internal
 * @module
 */

import { FsUtilsLive } from "@beep/repo-utils";
import { NodeChildProcessSpawner, NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Command } from "effect/unstable/cli";
import { FetchHttpClient } from "effect/unstable/http";
import { rootCommand } from "./commands/root.js";

/**
 * Foundation layer providing Node.js implementations of FileSystem, Path, and Terminal.
 *
 * These three services are leaf dependencies required by virtually every CLI
 * command and are combined here so they can be shared by all derived layers.
 *
 * @since 0.0.0
 * @category layers
 * @internal
 */
const BaseLayers = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, NodeTerminal.layer);

/**
 * Fully assembled runtime layer that merges higher-level services
 * (ChildProcessSpawner, FsUtils) on top of the {@link BaseLayers}.
 *
 * This layer satisfies all `Command.Environment` requirements plus
 * the repo-utils `FsUtils` service used by commands like `codegen`.
 *
 * @since 0.0.0
 * @category layers
 * @internal
 */
const DerivedLayers = Layer.mergeAll(NodeChildProcessSpawner.layer, FetchHttpClient.layer, FsUtilsLive).pipe(
  Layer.provideMerge(BaseLayers)
);

/**
 * Top-level CLI program effect produced by running the root command tree
 * with the fully-resolved {@link DerivedLayers}.
 *
 * This is the value handed to `Effect.runPromise` to execute the CLI.
 *
 * @since 0.0.0
 * @category commands
 * @internal
 */
const program = Command.run(rootCommand, { version: "0.0.0" }).pipe(Effect.provide(DerivedLayers));

Effect.runPromise(program).catch((err) => {
  console.error(err);
  process.exit(1);
});
