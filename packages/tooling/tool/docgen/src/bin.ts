#!/usr/bin/env bun

/**
 * @since 0.0.0
 */

import { FsUtilsLive } from "@beep/repo-utils";
import { BunRuntime } from "@effect/platform-bun";
import * as BunServices from "@effect/platform-bun/BunServices";
import { NodeChildProcessSpawner } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { Command } from "effect/unstable/cli";
import { docgenCommand } from "./CLI.js";
import * as Domain from "./Domain.js";
import * as InternalVersion from "./internal/version.js";

const BaseLayers = Layer.mergeAll(BunServices.layer, Domain.Process.layer);

const DerivedLayers = Layer.mergeAll(NodeChildProcessSpawner.layer, FsUtilsLive).pipe(Layer.provideMerge(BaseLayers));

const program = Effect.scoped(
  Layer.build(DerivedLayers).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (context) {
        return yield* Command.run(docgenCommand, { version: `v${InternalVersion.moduleVersion}` }).pipe(
          Effect.provide(context)
        );
      })
    )
  )
);

BunRuntime.runMain(program);
