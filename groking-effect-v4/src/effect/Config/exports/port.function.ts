/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: port
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.161Z
 *
 * Overview:
 * Creates a config for a port number (integer in 1–65535).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const port = yield* Config.port("PORT")
 *   console.log(port)
 * })
 *
 * const provider = ConfigProvider.fromEnv({
 *   env: {
 *     PORT: "8080"
 *   }
 * })
 *
 * Effect.runSync(
 *   program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))
 * )
 * // Output: 8080
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigModule from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "port";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a config for a port number (integer in 1–65535).";
const sourceExample =
  'import { Config, ConfigProvider, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const port = yield* Config.port("PORT")\n  console.log(port)\n})\n\nconst provider = ConfigProvider.fromEnv({\n  env: {\n    PORT: "8080"\n  }\n})\n\nEffect.runSync(\n  program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))\n)\n// Output: 8080';
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
  bunContext: BunContext,
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
