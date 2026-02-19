/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: makeRecord
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Creates a `Record` node representing an object-like container with known child keys.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 *
 * const node = ConfigProvider.makeRecord(new Set(["host", "port"]))
 * // { _tag: "Record", keys: Set(["host", "port"]), value: undefined }
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeRecord";
const exportKind = "function";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates a `Record` node representing an object-like container with known child keys.";
const sourceExample =
  'import { ConfigProvider } from "effect"\n\nconst node = ConfigProvider.makeRecord(new Set(["host", "port"]))\n// { _tag: "Record", keys: Set(["host", "port"]), value: undefined }';
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
