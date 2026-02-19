/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: date
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.161Z
 *
 * Overview:
 * Creates a config for a `Date` value parsed from a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 * 
 * const createdAt = Config.date("CREATED_AT")
 * 
 * const provider = ConfigProvider.fromUnknown({ CREATED_AT: "2024-01-15" })
 * // Effect.runSync(createdAt.parse(provider))
 * // Date("2024-01-15T00:00:00.000Z")
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
const exportName = "date";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a config for a `Date` value parsed from a string.";
const sourceExample = "import { Config, ConfigProvider, Effect } from \"effect\"\n\nconst createdAt = Config.date(\"CREATED_AT\")\n\nconst provider = ConfigProvider.fromUnknown({ CREATED_AT: \"2024-01-15\" })\n// Effect.runSync(createdAt.parse(provider))\n// Date(\"2024-01-15T00:00:00.000Z\")";
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
