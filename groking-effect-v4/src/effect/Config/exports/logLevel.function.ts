/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: logLevel
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.161Z
 *
 * Overview:
 * Creates a config for a log level string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const logLevel = yield* Config.logLevel("LOG_LEVEL")
 *   console.log(logLevel)
 * })
 * 
 * const provider = ConfigProvider.fromEnv({
 *   env: {
 *     LOG_LEVEL: "Info"
 *   }
 * })
 * 
 * Effect.runSync(
 *   program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))
 * )
 * // Output: "Info"
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigModule from "effect/Config";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "logLevel";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a config for a log level string.";
const sourceExample = "import { Config, ConfigProvider, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const logLevel = yield* Config.logLevel(\"LOG_LEVEL\")\n  console.log(logLevel)\n})\n\nconst provider = ConfigProvider.fromEnv({\n  env: {\n    LOG_LEVEL: \"Info\"\n  }\n})\n\nEffect.runSync(\n  program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))\n)\n// Output: \"Info\"";
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
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
