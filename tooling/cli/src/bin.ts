#!/usr/bin/env node

/**
 * CLI entry point.
 *
 * @since 0.0.0
 * @internal
 */

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { NodeFileSystem, NodePath, NodeTerminal, NodeChildProcessSpawner } from "@effect/platform-node";
import { Command } from "effect/unstable/cli";
import { FsUtilsLive } from "@beep/repo-utils";
import { rootCommand } from "./commands/root.js";

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
);

const DerivedLayers = Layer.mergeAll(
  NodeChildProcessSpawner.layer,
  FsUtilsLive,
).pipe(Layer.provideMerge(BaseLayers));

const program = Command.run(rootCommand, { version: "0.0.0" }).pipe(
  Effect.provide(DerivedLayers),
);

Effect.runPromise(program).catch((err) => {
  console.error(err);
  process.exit(1);
});
