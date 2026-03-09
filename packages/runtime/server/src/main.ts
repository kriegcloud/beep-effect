import { BunRuntime } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer } from "effect";
import { loadSidecarRuntimeConfig, runSidecarRuntime } from "./index.js";

const main = loadSidecarRuntimeConfig().pipe(
  Effect.annotateLogs({ component: "sidecar-config" }),
  Effect.withSpan("SidecarRuntime.loadConfig"),
  Effect.provide(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)),
  Effect.flatMap(runSidecarRuntime)
);

BunRuntime.runMain(main);
