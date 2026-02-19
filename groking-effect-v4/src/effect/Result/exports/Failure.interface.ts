/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: Failure
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * The failure variant of {@link Result}. Wraps an error of type `E`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const failure = Result.fail("Network error")
 *
 * if (Result.isFailure(failure)) {
 *   console.log(failure.failure)
 *   // Output: "Network error"
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Failure";
const exportKind = "interface";
const moduleImportPath = "effect/Result";
const sourceSummary = "The failure variant of {@link Result}. Wraps an error of type `E`.";
const sourceExample =
  'import { Result } from "effect"\n\nconst failure = Result.fail("Network error")\n\nif (Result.isFailure(failure)) {\n  console.log(failure.failure)\n  // Output: "Network error"\n}';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleFailureCompanionFlow = Effect.gen(function* () {
  yield* Console.log("Bridge to runtime APIs with Result.fail + Result.isFailure.");
  yield* inspectNamedExport({ moduleRecord, exportName: "fail" });

  const failure = ResultModule.fail("Network error");

  if (ResultModule.isFailure(failure)) {
    yield* Console.log("Result.isFailure(failure) => true");
    yield* Console.log(`failure.failure => ${String(failure.failure)}`);
    return;
  }

  yield* Console.log("Unexpected: Result.fail(...) did not produce a Failure.");
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
      description: "Create a failure result and read its payload after narrowing.",
      run: exampleFailureCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
