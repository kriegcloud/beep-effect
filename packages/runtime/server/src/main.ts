/**
 * Executable Bun entrypoint for the repo-memory sidecar runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { BunRuntime } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer } from "effect";
import { loadSidecarRuntimeConfig, runSidecarRuntime } from "./index.js";

const loadConfig = Effect.scoped(
  Layer.build(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)).pipe(
    Effect.flatMap((context) =>
      loadSidecarRuntimeConfig().pipe(
        Effect.annotateLogs({ component: "sidecar-config" }),
        Effect.withSpan("SidecarRuntime.loadConfig"),
        Effect.provide(context)
      )
    )
  )
);

const main = loadConfig.pipe(Effect.flatMap(runSidecarRuntime), Effect.scoped);

BunRuntime.runMain(main);
