/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: all
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Collects a structure of `Result`s into a single `Result` of collected values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * // Tuple
 * const tuple = Result.all([Result.succeed(1), Result.succeed("two")])
 * console.log(tuple)
 * // Output: { _tag: "Success", success: [1, "two"], ... }
 *
 * // Struct
 * const struct = Result.all({ x: Result.succeed(1), y: Result.fail("err") })
 * console.log(struct)
 * // Output: { _tag: "Failure", failure: "err", ... }
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
const exportName = "all";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Collects a structure of `Result`s into a single `Result` of collected values.";
const sourceExample =
  'import { Result } from "effect"\n\n// Tuple\nconst tuple = Result.all([Result.succeed(1), Result.succeed("two")])\nconsole.log(tuple)\n// Output: { _tag: "Success", success: [1, "two"], ... }\n\n// Struct\nconst struct = Result.all({ x: Result.succeed(1), y: Result.fail("err") })\nconsole.log(struct)\n// Output: { _tag: "Failure", failure: "err", ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

const summarizeResult = <A, E>(result: ResultModule.Result<A, E>): string =>
  ResultModule.match(result, {
    onSuccess: (success) => `Success(${JSON.stringify(success)})`,
    onFailure: (failure) => `Failure(${JSON.stringify(failure)})`,
  });

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.all as a callable runtime export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleTupleCollection = Effect.gen(function* () {
  yield* Console.log("Tuple input: successes are collected; first failure short-circuits.");
  const allSuccess = ResultModule.all([ResultModule.succeed(1), ResultModule.succeed("two")] as const);
  const firstFailure = ResultModule.all([
    ResultModule.succeed(1),
    ResultModule.fail("tuple-error"),
    ResultModule.succeed("not-inspected"),
  ] as const);

  yield* Console.log(`all([Success(1), Success("two")]) => ${summarizeResult(allSuccess)}`);
  yield* Console.log(`all([Success(1), Failure("tuple-error"), ...]) => ${summarizeResult(firstFailure)}`);
});

const exampleStructCollection = Effect.gen(function* () {
  yield* Console.log("Struct input: fields are collected unless any field is Failure.");
  const allSuccess = ResultModule.all({
    x: ResultModule.succeed(1),
    y: ResultModule.succeed("two"),
  });
  const firstFailure = ResultModule.all({
    x: ResultModule.succeed(1),
    y: ResultModule.fail("err"),
    z: ResultModule.succeed("not-inspected"),
  });

  yield* Console.log(`all({ x: Success(1), y: Success("two") }) => ${summarizeResult(allSuccess)}`);
  yield* Console.log(`all({ x: Success(1), y: Failure("err"), ... }) => ${summarizeResult(firstFailure)}`);
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
      title: "Tuple Collection Semantics",
      description: "Collect tuple successes and observe early failure propagation.",
      run: exampleTupleCollection,
    },
    {
      title: "Struct Collection Semantics",
      description: "Collect struct successes and observe early failure propagation.",
      run: exampleStructCollection,
    },
  ],
});

BunRuntime.runMain(program);
