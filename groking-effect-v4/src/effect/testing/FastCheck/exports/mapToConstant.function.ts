/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: mapToConstant
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/mapToConstant.d.ts
 * Generated: 2026-02-19T04:14:22.332Z
 *
 * Overview:
 * Generate non-contiguous ranges of values by mapping integer values to constant
 *
 * Source JSDoc Example:
 * ```ts
 * // generate alphanumeric values (a-z0-9)
 * mapToConstant(
 *   { num: 26, build: v => String.fromCharCode(v + 0x61) },
 *   { num: 10, build: v => String.fromCharCode(v + 0x30) },
 * )
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FastCheckModule from "effect/testing/FastCheck";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapToConstant";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Generate non-contiguous ranges of values by mapping integer values to constant";
const sourceExample =
  "// generate alphanumeric values (a-z0-9)\nmapToConstant(\n  { num: 26, build: v => String.fromCharCode(v + 0x61) },\n  { num: 10, build: v => String.fromCharCode(v + 0x30) },\n)";
const moduleRecord = FastCheckModule as Record<string, unknown>;

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
