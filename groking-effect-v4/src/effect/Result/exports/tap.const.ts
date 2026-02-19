/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: tap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Runs a side-effect on the success value without altering the `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(42),
 *   Result.tap((n) => console.log("Got:", n))
 * )
 * // Output: "Got: 42"
 *
 * console.log(Result.isSuccess(result))
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
const exportName = "tap";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Runs a side-effect on the success value without altering the `Result`.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(42),\n  Result.tap((n) => console.log("Got:", n))\n)\n// Output: "Got: 42"\n\nconsole.log(Result.isSuccess(result))\n// Output: true';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect tap as a runtime Result success-side-effect helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedSuccessTap = Effect.gen(function* () {
  yield* Console.log("Tap runs side-effects for Success and returns the original Result.");
  const original = ResultModule.succeed(42);
  const seen: Array<number> = [];

  const tapped = original.pipe(
    ResultModule.tap((n) => {
      seen.push(n);
    })
  );

  yield* Console.log(`seen: [${seen.join(", ")}]`);
  yield* Console.log(`result: ${summarizeResult(tapped)}`);
  yield* Console.log(`sameReference: ${Object.is(tapped, original)}`);
});

const exampleDataFirstAndFailureBehavior = Effect.gen(function* () {
  yield* Console.log("Data-first tap behaves the same and skips side-effects for Failure.");
  const observed: Array<number> = [];
  const successInput: ResultModule.Result<number, string> = ResultModule.succeed(7);
  const failureInput: ResultModule.Result<number, string> = ResultModule.fail("boom");

  const successOutput = ResultModule.tap(successInput, (n) => {
    observed.push(n * 10);
  });
  const observedAfterSuccess = [...observed];

  const failureOutput = ResultModule.tap(failureInput, (n) => {
    observed.push(n * 10);
  });

  yield* Console.log(`success -> ${summarizeResult(successOutput)} | observed: [${observedAfterSuccess.join(", ")}]`);
  yield* Console.log(`failure -> ${summarizeResult(failureOutput)} | observed: [${observed.join(", ")}]`);
  yield* Console.log(`successSameReference: ${Object.is(successOutput, successInput)}`);
  yield* Console.log(`failureSameReference: ${Object.is(failureOutput, failureInput)}`);
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
      title: "Source-Aligned Success Tap",
      description: "Run the documented Success tap flow and confirm side-effect plus identity preservation.",
      run: exampleSourceAlignedSuccessTap,
    },
    {
      title: "Data-First + Failure Behavior",
      description: "Show data-first invocation and that Failure bypasses side-effects while preserving identity.",
      run: exampleDataFirstAndFailureBehavior,
    },
  ],
});

BunRuntime.runMain(program);
