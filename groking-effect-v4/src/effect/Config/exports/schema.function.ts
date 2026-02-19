/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: schema
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.162Z
 *
 * Overview:
 * Creates a `Config<T>` from a `Schema.Codec`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect, Schema } from "effect"
 *
 * const DbConfig = Config.schema(
 *   Schema.Struct({
 *     host: Schema.String,
 *     port: Schema.Int
 *   }),
 *   "db"
 * )
 *
 * const provider = ConfigProvider.fromUnknown({
 *   db: { host: "localhost", port: 5432 }
 * })
 *
 * // Effect.runSync(DbConfig.parse(provider))
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
const exportName = "schema";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a `Config<T>` from a `Schema.Codec`.";
const sourceExample =
  'import { Config, ConfigProvider, Effect, Schema } from "effect"\n\nconst DbConfig = Config.schema(\n  Schema.Struct({\n    host: Schema.String,\n    port: Schema.Int\n  }),\n  "db"\n)\n\nconst provider = ConfigProvider.fromUnknown({\n  db: { host: "localhost", port: 5432 }\n})\n\n// Effect.runSync(DbConfig.parse(provider))\n// { host: "localhost", port: 5432 }';
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
