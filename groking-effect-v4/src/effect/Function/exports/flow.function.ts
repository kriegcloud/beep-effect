/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: flow
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:14:13.309Z
 *
 * Overview:
 * Performs left-to-right function composition. The first argument may have any arity, the remaining arguments must be unary.
 *
 * Source JSDoc Example:
 * ```ts
 * import { flow } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const len = (s: string): number => s.length
 * const double = (n: number): number => n * 2
 *
 * const f = flow(len, double)
 *
 * assert.strictEqual(f("aaa"), 6)
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
import * as FunctionModule from "effect/Function";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flow";
const exportKind = "function";
const moduleImportPath = "effect/Function";
const sourceSummary =
  "Performs left-to-right function composition. The first argument may have any arity, the remaining arguments must be unary.";
const sourceExample =
  'import { flow } from "effect/Function"\nimport * as assert from "node:assert"\n\nconst len = (s: string): number => s.length\nconst double = (n: number): number => n * 2\n\nconst f = flow(len, double)\n\nassert.strictEqual(f("aaa"), 6)';
const moduleRecord = FunctionModule as Record<string, unknown>;

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
