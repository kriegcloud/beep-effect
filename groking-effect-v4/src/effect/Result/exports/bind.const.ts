/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: bind
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Adds a named field to the do-notation accumulator by running a `Result`-producing function that receives the current accumulated object.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.Do,
 *   Result.bind("x", () => Result.succeed(2)),
 *   Result.bind("y", ({ x }) => Result.succeed(x + 3))
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: { x: 2, y: 5 }, ... }
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
const exportName = "bind";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Adds a named field to the do-notation accumulator by running a `Result`-producing function that receives the current accumulated object.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.Do,\n  Result.bind("x", () => Result.succeed(2)),\n  Result.bind("y", ({ x }) => Result.succeed(x + 3))\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: { x: 2, y: 5 }, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect bind as the do-notation helper used to add computed fields.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedBind = Effect.gen(function* () {
  yield* Console.log("Build a Result object by binding fields from prior accumulator values.");
  const result = ResultModule.Do.pipe(
    ResultModule.bind("x", () => ResultModule.succeed(2)),
    ResultModule.bind("y", ({ x }) => ResultModule.succeed(x + 3))
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("A failing bind stops later binds from running.");
  let downstreamInvoked = false;

  const result = ResultModule.Do.pipe(
    ResultModule.bind("x", () => ResultModule.succeed(2)),
    ResultModule.bind("y", () => ResultModule.fail("missing-y")),
    ResultModule.bind("z", ({ x }) => {
      downstreamInvoked = true;
      return ResultModule.succeed(x * 10);
    })
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`downstreamInvoked: ${downstreamInvoked}`);
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
      title: "Source-Aligned bind Composition",
      description: "Follow the documented do-notation flow and compute y from bound x.",
      run: exampleSourceAlignedBind,
    },
    {
      title: "Failure Short-Circuit",
      description: "Show that a failing bind preserves failure and skips downstream bind logic.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
