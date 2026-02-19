/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: failVoid
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * A pre-built `Result<void>` holding `undefined` as its failure value.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
const exportName = "failVoid";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "A pre-built `Result<void>` holding `undefined` as its failure value.";
const sourceExample = "";
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect failVoid as a pre-built runtime Result value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const examplePrebuiltFailureState = Effect.gen(function* () {
  yield* Console.log("Read failVoid as a Failure that carries undefined.");
  const result = ResultModule.failVoid;

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isFailure: ${ResultModule.isFailure(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);
  yield* Console.log(`merged value: ${formatUnknown(ResultModule.merge(result))}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("FailVoid short-circuits success-only continuations.");
  let continuationInvoked = false;

  const chained = ResultModule.failVoid.pipe(
    ResultModule.andThen((_: never) => {
      continuationInvoked = true;
      return ResultModule.succeed("step-ran");
    })
  );

  const recovered = ResultModule.getOrElse(() => "fallback-from-failVoid")(chained);
  yield* Console.log(`chained: ${summarizeResult(chained)}`);
  yield* Console.log(`continuationInvoked: ${continuationInvoked}`);
  yield* Console.log(`recovered: ${recovered}`);
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
      title: "Pre-built Failure Semantics",
      description: "Show that failVoid is a Failure carrying undefined in the failure channel.",
      run: examplePrebuiltFailureState,
    },
    {
      title: "Short-Circuit with andThen",
      description: "Demonstrate that failVoid skips success continuations and can be recovered.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
