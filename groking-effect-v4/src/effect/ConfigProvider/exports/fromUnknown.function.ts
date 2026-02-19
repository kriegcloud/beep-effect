/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: fromUnknown
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:50:34.513Z
 *
 * Overview:
 * Creates a `ConfigProvider` backed by an in-memory JavaScript value (typically a parsed JSON object).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 *
 * const provider = ConfigProvider.fromUnknown({
 *   database: {
 *     host: "localhost",
 *     port: 5432
 *   }
 * })
 *
 * const host = Config.string("host").parse(
 *   provider.pipe(ConfigProvider.nested("database"))
 * )
 *
 * // Effect.runSync(host) // "localhost"
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromUnknown";
const exportKind = "function";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary =
  "Creates a `ConfigProvider` backed by an in-memory JavaScript value (typically a parsed JSON object).";
const sourceExample =
  'import { Config, ConfigProvider, Effect } from "effect"\n\nconst provider = ConfigProvider.fromUnknown({\n  database: {\n    host: "localhost",\n    port: 5432\n  }\n})\n\nconst host = Config.string("host").parse(\n  provider.pipe(ConfigProvider.nested("database"))\n)\n\n// Effect.runSync(host) // "localhost"';
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
