/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: fromEnv
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.182Z
 *
 * Overview:
 * Creates a `ConfigProvider` backed by environment variables.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 * 
 * const provider = ConfigProvider.fromEnv({
 *   env: {
 *     DATABASE_HOST: "localhost",
 *     DATABASE_PORT: "5432"
 *   }
 * })
 * 
 * const host = Config.string("HOST").parse(
 *   provider.pipe(ConfigProvider.nested("DATABASE"))
 * )
 * 
 * // Effect.runSync(host) // "localhost"
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigProviderModule from "effect/ConfigProvider";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromEnv";
const exportKind = "function";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates a `ConfigProvider` backed by environment variables.";
const sourceExample = "import { Config, ConfigProvider, Effect } from \"effect\"\n\nconst provider = ConfigProvider.fromEnv({\n  env: {\n    DATABASE_HOST: \"localhost\",\n    DATABASE_PORT: \"5432\"\n  }\n})\n\nconst host = Config.string(\"HOST\").parse(\n  provider.pipe(ConfigProvider.nested(\"DATABASE\"))\n)\n\n// Effect.runSync(host) // \"localhost\"";
const moduleRecord = ConfigProviderModule as Record<string, unknown>;

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
