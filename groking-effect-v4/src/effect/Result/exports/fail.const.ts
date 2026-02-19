/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: fail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Creates a `Result` holding a `Failure` value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const result = Result.fail("Something went wrong")
 *
 * console.log(Result.isFailure(result))
 * // Output: true
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fail";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Creates a `Result` holding a `Failure` value.";
const sourceExample =
  'import { Result } from "effect"\n\nconst result = Result.fail("Something went wrong")\n\nconsole.log(Result.isFailure(result))\n// Output: true';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect fail as a callable constructor for Failure results.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedFailure = Effect.gen(function* () {
  yield* Console.log("Create a failure result and confirm the Failure tag.");
  const result = ResultModule.fail("Something went wrong");

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isFailure: ${ResultModule.isFailure(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("Failure input short-circuits and preserves the original failure.");
  let nextStepInvoked = false;

  const result = ResultModule.fail("network-unreachable").pipe(
    ResultModule.andThen((_: never) => {
      nextStepInvoked = true;
      return ResultModule.succeed("unreachable");
    })
  );

  const fallback = ResultModule.getOrElse((failure) => `fallback:${String(failure)}`)(result);
  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`nextStepInvoked: ${nextStepInvoked}`);
  yield* Console.log(`fallback: ${fallback}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Create a Failure Result",
      description: "Use fail with the source-aligned string input and verify Failure predicates.",
      run: exampleSourceAlignedFailure,
    },
    {
      title: "Failure Short-Circuit Behavior",
      description: "Show that chaining skips success-only work and recover with getOrElse.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
