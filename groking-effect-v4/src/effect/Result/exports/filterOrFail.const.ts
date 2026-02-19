/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: filterOrFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Validates the success value of a `Result` using a predicate, failing with a custom error if the predicate returns `false`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(0),
 *   Result.filterOrFail(
 *     (n) => n > 0,
 *     (n) => `${n} is not positive`
 *   )
 * )
 * console.log(result)
 * // Output: { _tag: "Failure", failure: "0 is not positive", ... }
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
const exportName = "filterOrFail";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Validates the success value of a `Result` using a predicate, failing with a custom error if the predicate returns `false`.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(0),\n  Result.filterOrFail(\n    (n) => n > 0,\n    (n) => `${n} is not positive`\n  )\n)\nconsole.log(result)\n// Output: { _tag: "Failure", failure: "0 is not positive", ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect filterOrFail as a callable Result helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedFiltering = Effect.gen(function* () {
  yield* Console.log("Filter success values and fail with the provided mapper.");

  const passing = ResultModule.succeed(5).pipe(
    ResultModule.filterOrFail(
      (n) => n > 0,
      (n) => `${n} is not positive`
    )
  );
  const failing = ResultModule.succeed(0).pipe(
    ResultModule.filterOrFail(
      (n) => n > 0,
      (n) => `${n} is not positive`
    )
  );

  yield* Console.log(`passing: ${summarizeResult(passing)}`);
  yield* Console.log(`failing: ${summarizeResult(failing)}`);
});

const exampleFailurePassThrough = Effect.gen(function* () {
  yield* Console.log("Existing failures are preserved and skip predicate checks.");
  let predicateRuns = 0;

  const input: ResultModule.Result<number, string> = ResultModule.fail("already-failed");
  const output = input.pipe(
    ResultModule.filterOrFail(
      (n) => {
        predicateRuns += 1;
        return n > 0;
      },
      (n) => `${n} is not positive`
    )
  );

  yield* Console.log(`output: ${summarizeResult(output)}`);
  yield* Console.log(`predicateRuns: ${predicateRuns}`);
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
      title: "Source-Aligned Filtering",
      description: "Apply filterOrFail to success values and compare pass/fail outputs.",
      run: exampleSourceAlignedFiltering,
    },
    {
      title: "Failure Pass-Through",
      description: "Show that existing failures stay unchanged and skip predicate execution.",
      run: exampleFailurePassThrough,
    },
  ],
});

BunRuntime.runMain(program);
