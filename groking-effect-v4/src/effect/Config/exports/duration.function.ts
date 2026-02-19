/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: duration
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:50:34.489Z
 *
 * Overview:
 * Creates a config for a `Duration` value parsed from a human-readable string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const duration = yield* Config.duration("DURATION")
 *   console.log(duration)
 * })
 *
 * const provider = ConfigProvider.fromEnv({
 *   env: {
 *     DURATION: "10 seconds"
 *   }
 * })
 *
 * Effect.runSync(
 *   program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))
 * )
 * // Output: Duration { _tag: "millis", value: 10000 }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigModule from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "duration";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a config for a `Duration` value parsed from a human-readable string.";
const sourceExample =
  'import { Config, ConfigProvider, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const duration = yield* Config.duration("DURATION")\n  console.log(duration)\n})\n\nconst provider = ConfigProvider.fromEnv({\n  env: {\n    DURATION: "10 seconds"\n  }\n})\n\nEffect.runSync(\n  program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))\n)\n// Output: Duration { _tag: "millis", value: 10000 }';
const moduleRecord = ConfigModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
