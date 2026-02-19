/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: all
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.160Z
 *
 * Overview:
 * Combines multiple configs into a single config that parses all of them.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 *
 * const dbConfig = Config.all({
 *   host: Config.string("host"),
 *   port: Config.number("port")
 * })
 *
 * const provider = ConfigProvider.fromUnknown({ host: "localhost", port: 5432 })
 * // Effect.runSync(dbConfig.parse(provider))
 * // { host: "localhost", port: 5432 }
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
const exportName = "all";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Combines multiple configs into a single config that parses all of them.";
const sourceExample =
  'import { Config, ConfigProvider, Effect } from "effect"\n\nconst dbConfig = Config.all({\n  host: Config.string("host"),\n  port: Config.number("port")\n})\n\nconst provider = ConfigProvider.fromUnknown({ host: "localhost", port: 5432 })\n// Effect.runSync(dbConfig.parse(provider))\n// { host: "localhost", port: 5432 }';
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
