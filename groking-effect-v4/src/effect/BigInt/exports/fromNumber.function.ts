/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: fromNumber
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:50:32.919Z
 *
 * Overview:
 * Converts a number to a `bigint`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigInt } from "effect"
 *
 * BigInt.fromNumber(42) // 42n
 *
 * BigInt.fromNumber(Number.MAX_SAFE_INTEGER + 1) // undefined
 * BigInt.fromNumber(Number.MIN_SAFE_INTEGER - 1) // undefined
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
import * as BigIntModule from "effect/BigInt";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromNumber";
const exportKind = "function";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Converts a number to a `bigint`.";
const sourceExample =
  'import { BigInt } from "effect"\n\nBigInt.fromNumber(42) // 42n\n\nBigInt.fromNumber(Number.MAX_SAFE_INTEGER + 1) // undefined\nBigInt.fromNumber(Number.MIN_SAFE_INTEGER - 1) // undefined';
const moduleRecord = BigIntModule as Record<string, unknown>;

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
