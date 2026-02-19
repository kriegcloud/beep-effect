/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: schedulerFor
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/scheduler.d.ts
 * Generated: 2026-02-19T04:50:43.249Z
 *
 * Overview:
 * For custom scheduler with predefined resolution order
 *
 * Source JSDoc Example:
 * ```ts
 * fc.schedulerFor()`
 *   -> [task\${2}] promise pending
 *   -> [task\${3}] promise pending
 *   -> [task\${1}] promise pending
 * `
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
const exportName = "schedulerFor";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "For custom scheduler with predefined resolution order";
const sourceExample =
  "fc.schedulerFor()`\n  -> [task\\${2}] promise pending\n  -> [task\\${3}] promise pending\n  -> [task\\${1}] promise pending\n`";
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
