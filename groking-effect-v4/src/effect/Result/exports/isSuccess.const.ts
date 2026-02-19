/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: isSuccess
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Checks whether a `Result` is a `Success`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const result = Result.succeed(42)
 *
 * if (Result.isSuccess(result)) {
 *   console.log(result.success)
 *   // Output: 42
 * }
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
const exportName = "isSuccess";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Checks whether a `Result` is a `Success`.";
const sourceExample =
  'import { Result } from "effect"\n\nconst result = Result.succeed(42)\n\nif (Result.isSuccess(result)) {\n  console.log(result.success)\n  // Output: 42\n}';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isSuccess as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedNarrowing = Effect.gen(function* () {
  const result = ResultModule.succeed(42);
  const success = ResultModule.isSuccess(result);

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isSuccess(result): ${success}`);
  if (success) {
    yield* Console.log(`success payload: ${result.success}`);
  }
});

const exampleSuccessCollection = Effect.gen(function* () {
  const samples: Array<ResultModule.Result<number, string>> = [
    ResultModule.succeed(42),
    ResultModule.fail("invalid input"),
    ResultModule.succeed(7),
  ];

  const successes = samples.filter(ResultModule.isSuccess);

  yield* Console.log(`samples: ${samples.map(summarizeResult).join(", ")}`);
  yield* Console.log(`success count: ${successes.length}/${samples.length}`);
  yield* Console.log(`success values: ${successes.map((item) => item.success).join(", ")}`);
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
      title: "Source-Aligned Success Narrowing",
      description: "Reproduce the JSDoc flow and read .success after isSuccess narrows the value.",
      run: exampleSourceAlignedNarrowing,
    },
    {
      title: "Filtering to Successes",
      description: "Use isSuccess as a predicate to keep only Success results from a mixed list.",
      run: exampleSuccessCollection,
    },
  ],
});

BunRuntime.runMain(program);
