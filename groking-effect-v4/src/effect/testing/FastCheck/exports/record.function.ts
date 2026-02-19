/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: record
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/record.d.ts
 * Generated: 2026-02-19T04:50:43.248Z
 *
 * Overview:
 * For records following the `recordModel` schema
 *
 * Source JSDoc Example:
 * ```ts
 * record({ x: someArbitraryInt, y: someArbitraryInt }, {requiredKeys: []}): Arbitrary<{x?:number,y?:number}>
 * // merge two integer arbitraries to produce a {x, y}, {x}, {y} or {} record
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FastCheckModule from "effect/testing/FastCheck";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "record";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "For records following the `recordModel` schema";
const sourceExample =
  "record({ x: someArbitraryInt, y: someArbitraryInt }, {requiredKeys: []}): Arbitrary<{x?:number,y?:number}>\n// merge two integer arbitraries to produce a {x, y}, {x}, {y} or {} record";
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
