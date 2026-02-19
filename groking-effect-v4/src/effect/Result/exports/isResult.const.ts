/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: isResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Tests whether a value is a `Result` (either `Success` or `Failure`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.isResult(Result.succeed(1)))
 * // Output: true
 *
 * console.log(Result.isResult({ value: 1 }))
 * // Output: false
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
const exportName = "isResult";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Tests whether a value is a `Result` (either `Success` or `Failure`).";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.isResult(Result.succeed(1)))\n// Output: true\n\nconsole.log(Result.isResult({ value: 1 }))\n// Output: false';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isResult as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedCheck = Effect.gen(function* () {
  const success = ResultModule.succeed(1);
  const plainObject = { value: 1 };

  yield* Console.log(`isResult(Result.succeed(1)): ${ResultModule.isResult(success)}`);
  yield* Console.log(`isResult({ value: 1 }): ${ResultModule.isResult(plainObject)}`);
});

const exampleFilteringMixedValues = Effect.gen(function* () {
  const mixedValues: Array<unknown> = [
    ResultModule.succeed({ userId: 1 }),
    ResultModule.fail("invalid payload"),
    { value: 1 },
    null,
  ];
  const recognizedResults = mixedValues.filter(ResultModule.isResult);

  yield* Console.log(`recognized results: ${recognizedResults.length}/${mixedValues.length}`);
  yield* Console.log(`recognized values: ${recognizedResults.map(summarizeResult).join(", ")}`);
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
      title: "Source-Aligned Result Check",
      description: "Reproduce the JSDoc checks for a real Result and a plain object.",
      run: exampleSourceAlignedCheck,
    },
    {
      title: "Filtering Mixed Values",
      description: "Use isResult as a predicate to keep only Success/Failure values.",
      run: exampleFilteringMixedValues,
    },
  ],
});

BunRuntime.runMain(program);
