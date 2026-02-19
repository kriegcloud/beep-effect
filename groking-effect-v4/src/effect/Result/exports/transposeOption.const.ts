/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: transposeOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Transforms `Option<Result<A, E>>` into `Result<Option<A>, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * const some = Option.some(Result.succeed(42))
 * console.log(Result.transposeOption(some))
 * // Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }
 *
 * const none = Option.none<Result.Result<number, string>>()
 * console.log(Result.transposeOption(none))
 * // Output: { _tag: "Success", success: { _tag: "None" }, ... }
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
import * as O from "effect/Option";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "transposeOption";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Transforms `Option<Result<A, E>>` into `Result<Option<A>, E>`.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconst some = Option.some(Result.succeed(42))\nconsole.log(Result.transposeOption(some))\n// Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }\n\nconst none = Option.none<Result.Result<number, string>>()\nconsole.log(Result.transposeOption(none))\n// Output: { _tag: "Success", success: { _tag: "None" }, ... }';

const summarizeOption = (option: O.Option<unknown>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  })(option);

const summarizeResult = (result: ResultModule.Result<O.Option<unknown>, unknown>): string =>
  ResultModule.isSuccess(result)
    ? `Success(${summarizeOption(result.success)})`
    : `Failure(${formatUnknown(result.failure)})`;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSomeAndNone = Effect.gen(function* () {
  yield* Console.log("Transpose Some(Success) and None using the documented shape.");

  const someInput = O.some(ResultModule.succeed(42));
  const noneInput = O.none<ResultModule.Result<number, string>>();

  const transposedSome = ResultModule.transposeOption(someInput);
  const transposedNone = ResultModule.transposeOption(noneInput);

  yield* Console.log(`some(success(42)) -> ${summarizeResult(transposedSome)}`);
  yield* Console.log(`none -> ${summarizeResult(transposedNone)}`);
});

const exampleFailurePropagation = Effect.gen(function* () {
  yield* Console.log("Transpose Some(Failure) to confirm error propagation.");

  const failureInput = O.some(ResultModule.fail("not a number"));
  const successInput = O.some(ResultModule.succeed(7));

  const transposedFailure = ResultModule.transposeOption(failureInput);
  const transposedSuccess = ResultModule.transposeOption(successInput);

  yield* Console.log(`some(failure("not a number")) -> ${summarizeResult(transposedFailure)}`);
  yield* Console.log(`some(success(7)) -> ${summarizeResult(transposedSuccess)}`);
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
      title: "Source-Aligned Some And None",
      description: "Use Option.some(Result.succeed(...)) and Option.none() with transposeOption.",
      run: exampleSourceAlignedSomeAndNone,
    },
    {
      title: "Failure Propagation",
      description: "Show that Some(Result.fail(e)) becomes Failure(e) while Success values stay wrapped in Some.",
      run: exampleFailurePropagation,
    },
  ],
});

BunRuntime.runMain(program);
