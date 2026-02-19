/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Chains a function that returns a `Result` onto a successful value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(5),
 *   Result.flatMap((n) =>
 *     n > 0 ? Result.succeed(n * 2) : Result.fail("not positive")
 *   )
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: 10, ... }
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Chains a function that returns a `Result` onto a successful value.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(5),\n  Result.flatMap((n) =>\n    n > 0 ? Result.succeed(n * 2) : Result.fail("not positive")\n  )\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: 10, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect flatMap as a callable Result chaining helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedBranching = Effect.gen(function* () {
  yield* Console.log("Chain with flatMap and branch to Success/Failure in mapper.");
  const fromPositive = ResultModule.succeed(5).pipe(
    ResultModule.flatMap((n) => (n > 0 ? ResultModule.succeed(n * 2) : ResultModule.fail("not positive")))
  );
  const fromNegative = ResultModule.succeed(-2).pipe(
    ResultModule.flatMap((n) => (n > 0 ? ResultModule.succeed(n * 2) : ResultModule.fail("not positive")))
  );

  yield* Console.log(`input 5 -> ${summarizeResult(fromPositive)}`);
  yield* Console.log(`input -2 -> ${summarizeResult(fromNegative)}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("Failure input short-circuits and skips mapper execution.");
  let mapperInvoked = false;

  const output = ResultModule.fail("input-failure").pipe(
    ResultModule.flatMap((_: never) => {
      mapperInvoked = true;
      return ResultModule.succeed("unreachable");
    })
  );

  yield* Console.log(`output: ${summarizeResult(output)}`);
  yield* Console.log(`mapperInvoked: ${mapperInvoked}`);
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
      title: "Source-Aligned Branching",
      description: "Use flatMap to map positive input to success and non-positive input to failure.",
      run: exampleSourceAlignedBranching,
    },
    {
      title: "Failure Short-Circuit",
      description: "Show that a failure input is preserved and mapper logic is not run.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
