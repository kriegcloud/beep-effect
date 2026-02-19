/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: orElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Returns the original `Result` if it is a `Success`, otherwise applies `that` to the error and returns the resulting `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.fail("primary failed"),
 *   Result.orElse(() => Result.succeed(99))
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: 99, ... }
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
const exportName = "orElse";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Returns the original `Result` if it is a `Success`, otherwise applies `that` to the error and returns the resulting `Result`.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.fail("primary failed"),\n  Result.orElse(() => Result.succeed(99))\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: 99, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.orElse as a callable runtime export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedRecovery = Effect.gen(function* () {
  yield* Console.log("Recover a Failure and preserve Success with the documented orElse form.");
  const fromFailure = ResultModule.fail("primary failed").pipe(ResultModule.orElse(() => ResultModule.succeed(99)));
  const fromSuccess = ResultModule.succeed(42).pipe(ResultModule.orElse(() => ResultModule.succeed(99)));

  yield* Console.log(`fail("primary failed") -> ${summarizeResult(fromFailure)}`);
  yield* Console.log(`succeed(42) -> ${summarizeResult(fromSuccess)}`);
});

const exampleDataFirstFallbackBehavior = Effect.gen(function* () {
  yield* Console.log("Use data-first orElse(self, that) and show fallback invocation count.");
  let fallbackCalls = 0;

  const fallback = (failure: { readonly step: string; readonly reason: string }) => {
    fallbackCalls += 1;
    return ResultModule.succeed(`recovered:${failure.step}:${failure.reason}`);
  };

  const recovered = ResultModule.orElse(ResultModule.fail({ step: "fetch", reason: "not-found" }), fallback);
  const callsAfterFailure = fallbackCalls;
  const untouched = ResultModule.orElse(ResultModule.succeed("cached"), fallback);
  const callsAfterSuccess = fallbackCalls;

  yield* Console.log(`orElse(fail({...}), fallback) -> ${summarizeResult(recovered)} (calls: ${callsAfterFailure})`);
  yield* Console.log(
    `orElse(succeed("cached"), fallback) -> ${summarizeResult(untouched)} (calls: ${callsAfterSuccess})`
  );
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
      title: "Source-Aligned Recovery",
      description: "Reproduce the JSDoc-style fallback on Failure while preserving Success values.",
      run: exampleSourceAlignedRecovery,
    },
    {
      title: "Data-First Fallback Behavior",
      description: "Call data-first orElse and verify fallback executes only for Failure inputs.",
      run: exampleDataFirstFallbackBehavior,
    },
  ],
});

BunRuntime.runMain(program);
