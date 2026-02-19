/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: TimeoutError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * An error indicating that an operation exceeded its time limit.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.TimeoutError("Operation timed out")
 * console.log(error._tag)    // "TimeoutError"
 * console.log(error.message) // "Operation timed out"
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import { createPlaygroundProgram, inspectTypeLikeExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TimeoutError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "An error indicating that an operation exceeded its time limit.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst error = new Cause.TimeoutError("Operation timed out")\nconsole.log(error._tag)    // "TimeoutError"\nconsole.log(error.message) // "Operation timed out"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Compile-time `TimeoutError` is erased; inspect runtime symbol visibility.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleRuntimeCompanionFlow = Effect.gen(function* () {
  const timeoutError = new CauseModule.TimeoutError("Operation timed out");
  const instanceCheck = CauseModule.isTimeoutError(timeoutError);
  const plainErrorCheck = CauseModule.isTimeoutError(new Error("Operation timed out"));

  yield* Console.log(`Constructed ${timeoutError._tag} with message: ${timeoutError.message}`);
  yield* Console.log(`Cause.isTimeoutError(instance): ${instanceCheck}`);
  yield* Console.log(`Cause.isTimeoutError(Error): ${plainErrorCheck}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Runtime Companion Flow",
      description: "Use `Cause.TimeoutError` and `Cause.isTimeoutError` at runtime.",
      run: exampleRuntimeCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
