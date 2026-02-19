/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: bindTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Wraps the success value of a `Result` into a named field, producing a `Result<Record<N, A>>`. This is typically used to start a do-notation chain from an existing `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(42),
 *   Result.bindTo("answer")
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: { answer: 42 }, ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "bindTo";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Wraps the success value of a `Result` into a named field, producing a `Result<Record<N, A>>`. This is typically used to start a do-notation chain from an existing `Result`.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(42),\n  Result.bindTo("answer")\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: { answer: 42 }, ... }';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedBinding = Effect.gen(function* () {
  yield* Console.log("Wrap a successful value into a named record field with bindTo.");
  const result = ResultModule.succeed(42).pipe(ResultModule.bindTo("answer"));

  yield* Console.log(`result: ${summarizeResult(result)}`);
  const extracted = ResultModule.match({
    onFailure: () => "unreachable",
    onSuccess: ({ answer }) => `answer=${answer}`,
  })(result);
  yield* Console.log(`extracted: ${extracted}`);
});

const exampleDoNotationFromExistingResult = Effect.gen(function* () {
  yield* Console.log("Use bindTo to seed a do-notation chain from an existing Result.");
  const result = ResultModule.succeed(2).pipe(
    ResultModule.bindTo("x"),
    ResultModule.bind("y", ({ x }) => ResultModule.succeed(x + 3)),
    ResultModule.let("sum", ({ x, y }) => x + y)
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("Failure input stays failed and skips downstream bind work.");
  let bindInvoked = false;

  const result = ResultModule.fail("missing-input").pipe(
    ResultModule.bindTo("value"),
    ResultModule.bind("next", () => {
      bindInvoked = true;
      return ResultModule.succeed("unreachable");
    })
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`bindInvoked: ${bindInvoked}`);
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
      title: "Source-Aligned Binding",
      description: 'Apply bindTo("answer") to wrap a successful value into a named field.',
      run: exampleSourceAlignedBinding,
    },
    {
      title: "Start Do-Notation Chain",
      description: "Use bindTo before bind/let to build a structured success value.",
      run: exampleDoNotationFromExistingResult,
    },
    {
      title: "Failure Short-Circuit",
      description: "Show that bindTo preserves failures and downstream bind callbacks are skipped.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
