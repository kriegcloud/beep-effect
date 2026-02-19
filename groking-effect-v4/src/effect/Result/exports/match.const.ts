/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Folds a `Result` into a single value by applying one of two functions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const format = Result.match({
 *   onSuccess: (n: number) => `Got ${n}`,
 *   onFailure: (e: string) => `Err: ${e}`
 * })
 *
 * console.log(format(Result.succeed(42)))
 * // Output: "Got 42"
 *
 * console.log(format(Result.fail("timeout")))
 * // Output: "Err: timeout"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Folds a `Result` into a single value by applying one of two functions.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst format = Result.match({\n  onSuccess: (n: number) => `Got ${n}`,\n  onFailure: (e: string) => `Err: ${e}`\n})\n\nconsole.log(format(Result.succeed(42)))\n// Output: "Got 42"\n\nconsole.log(format(Result.fail("timeout")))\n// Output: "Err: timeout"';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.match as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFormatter = Effect.gen(function* () {
  yield* Console.log("Build a formatter with Result.match({ onSuccess, onFailure }).");
  const format = ResultModule.match({
    onSuccess: (n: number) => `Got ${n}`,
    onFailure: (e: string) => `Err: ${e}`,
  });

  const successMessage = format(ResultModule.succeed(42));
  const failureMessage = format(ResultModule.fail("timeout"));

  yield* Console.log(`succeed(42) -> ${successMessage}`);
  yield* Console.log(`fail("timeout") -> ${failureMessage}`);
});

const exampleDataFirstOneOffFold = Effect.gen(function* () {
  yield* Console.log("Use data-first Result.match(result, handlers) for one-off folds.");
  const toLabel = {
    onSuccess: (value: { id: number; active: boolean }) => `ok:${value.id}:${value.active ? "active" : "inactive"}`,
    onFailure: (error: { code: number; retryable: boolean }) =>
      `err:${error.code}:${error.retryable ? "retryable" : "final"}`,
  };

  const success = ResultModule.succeed({ id: 7, active: true });
  const failure = ResultModule.fail({ code: 503, retryable: true });

  const successLabel = ResultModule.match(success, toLabel);
  const failureLabel = ResultModule.match(failure, toLabel);

  yield* Console.log(`success -> ${successLabel}`);
  yield* Console.log(`failure -> ${failureLabel}`);
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
      title: "Source-Aligned Formatter",
      description: "Create a reusable formatter and fold Success/Failure into strings.",
      run: exampleSourceAlignedFormatter,
    },
    {
      title: "Data-First One-Off Fold",
      description: "Use the non-curried form to fold single Result values directly.",
      run: exampleDataFirstOneOffFold,
    },
  ],
});

BunRuntime.runMain(program);
