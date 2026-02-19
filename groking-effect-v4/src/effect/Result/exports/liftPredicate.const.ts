/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: liftPredicate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Lifts a value into a `Result` based on a predicate or refinement.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const ensurePositive = pipe(
 *   5,
 *   Result.liftPredicate(
 *     (n: number) => n > 0,
 *     (n) => `${n} is not positive`
 *   )
 * )
 * console.log(ensurePositive)
 * // Output: { _tag: "Success", success: 5, ... }
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
const exportName = "liftPredicate";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Lifts a value into a `Result` based on a predicate or refinement.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst ensurePositive = pipe(\n  5,\n  Result.liftPredicate(\n    (n: number) => n > 0,\n    (n) => `${n} is not positive`\n  )\n)\nconsole.log(ensurePositive)\n// Output: { _tag: "Success", success: 5, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect liftPredicate as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedValidation = Effect.gen(function* () {
  yield* Console.log("Lift a positive-number predicate into a reusable Result constructor.");

  const ensurePositive = ResultModule.liftPredicate(
    (n: number) => n > 0,
    (n) => `${n} is not positive`
  );
  const positive = ensurePositive(5);
  const notPositive = ensurePositive(0);

  yield* Console.log(`ensurePositive(5): ${summarizeResult(positive)}`);
  yield* Console.log(`ensurePositive(0): ${summarizeResult(notPositive)}`);
});

const exampleDataFirstInvocation = Effect.gen(function* () {
  yield* Console.log("Use the data-first overload and observe when the error mapper runs.");

  let errorMapperCalls = 0;
  const oddError = (n: number): string => {
    errorMapperCalls += 1;
    return `${n} is odd`;
  };

  const even = ResultModule.liftPredicate(8, (n: number) => n % 2 === 0, oddError);
  const odd = ResultModule.liftPredicate(7, (n: number) => n % 2 === 0, oddError);

  yield* Console.log(`liftPredicate(8, isEven, oddError): ${summarizeResult(even)}`);
  yield* Console.log(`liftPredicate(7, isEven, oddError): ${summarizeResult(odd)}`);
  yield* Console.log(`oddError calls: ${errorMapperCalls}`);
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
      title: "Source-Aligned Predicate Lift",
      description: "Use data-last invocation to turn a predicate into a Result-producing function.",
      run: exampleSourceAlignedValidation,
    },
    {
      title: "Data-First Invocation",
      description: "Call liftPredicate directly with a value and confirm failure mapping behavior.",
      run: exampleDataFirstInvocation,
    },
  ],
});

BunRuntime.runMain(program);
