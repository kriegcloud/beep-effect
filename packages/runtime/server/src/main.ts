import { BunPath, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { loadSidecarRuntimeConfig, runSidecarRuntime } from "./index.js";

const main = loadSidecarRuntimeConfig().pipe(
  Effect.annotateLogs({ component: "sidecar-config" }),
  Effect.withSpan("SidecarRuntime.loadConfig"),
  Effect.provide(BunPath.layer),
  Effect.flatMap(runSidecarRuntime)
);

BunRuntime.runMain(main);
