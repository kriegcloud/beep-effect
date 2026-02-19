/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: Result
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * A value that is either `Success<A, E>` or `Failure<A, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const success = Result.succeed(42)
 * const failure = Result.fail("something went wrong")
 *
 * const message = Result.match(success, {
 *   onSuccess: (value) => `Success: ${value}`,
 *   onFailure: (error) => `Error: ${error}`
 * })
 * console.log(message)
 * // Output: "Success: 42"
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
const exportName = "Result";
const exportKind = "type";
const moduleImportPath = "effect/Result";
const sourceSummary = "A value that is either `Success<A, E>` or `Failure<A, E>`.";
const sourceExample =
  'import { Result } from "effect"\n\nconst success = Result.succeed(42)\nconst failure = Result.fail("something went wrong")\n\nconst message = Result.match(success, {\n  onSuccess: (value) => `Success: ${value}`,\n  onFailure: (error) => `Error: ${error}`\n})\nconsole.log(message)\n// Output: "Success: 42"';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Result is a compile-time type alias; confirm runtime erasure.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionRuntimeFlow = Effect.gen(function* () {
  yield* Console.log("Bridge: use runtime companion APIs because the Result type is erased.");
  yield* inspectNamedExport({ moduleRecord, exportName: "match" });

  const success = ResultModule.succeed(42);
  const failure = ResultModule.fail("something went wrong");

  const successMessage = ResultModule.match(success, {
    onSuccess: (value) => `Success: ${value}`,
    onFailure: (error) => `Error: ${error}`,
  });
  const failureMessage = ResultModule.match(failure, {
    onSuccess: (value) => `Success: ${value}`,
    onFailure: (error) => `Error: ${error}`,
  });

  yield* Console.log(`success -> ${successMessage}`);
  yield* Console.log(`failure -> ${failureMessage}`);
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
      title: "Companion API Flow",
      description: "Create and match Success/Failure values with runtime Result APIs.",
      run: exampleCompanionRuntimeFlow,
    },
  ],
});

BunRuntime.runMain(program);
