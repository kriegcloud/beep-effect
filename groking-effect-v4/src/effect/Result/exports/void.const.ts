/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: void
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * No summary found in JSDoc.
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
const exportName = "void";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.void as a pre-built runtime Result value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const examplePrebuiltSuccessState = Effect.gen(function* () {
  yield* Console.log("Read void as a Success that carries undefined.");
  const result = ResultModule.void;

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);
  yield* Console.log(`isFailure: ${ResultModule.isFailure(result)}`);
  yield* Console.log(`merged value: ${formatUnknown(ResultModule.merge(result))}`);
});

const exampleSuccessContinuationFlow = Effect.gen(function* () {
  yield* Console.log("Success continuations run, and failure fallback stays unused.");
  let fallbackInvoked = false;

  const mapped = ResultModule.void.pipe(ResultModule.map(() => "mapped-from-void"));
  const chained = ResultModule.void.pipe(ResultModule.andThen(() => ResultModule.succeed("continued")));
  const fallbackValue = ResultModule.getOrElse(() => {
    fallbackInvoked = true;
    return "fallback";
  })(ResultModule.void);

  yield* Console.log(`mapped: ${summarizeResult(mapped)}`);
  yield* Console.log(`chained: ${summarizeResult(chained)}`);
  yield* Console.log(`fallbackValue: ${formatUnknown(fallbackValue)}`);
  yield* Console.log(`fallbackInvoked: ${fallbackInvoked}`);
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
      title: "Pre-built Success Semantics",
      description: "Show that Result.void is Success(undefined) in the success channel.",
      run: examplePrebuiltSuccessState,
    },
    {
      title: "Success Continuation Flow",
      description: "Demonstrate map/andThen execution and that getOrElse fallback is not used.",
      run: exampleSuccessContinuationFlow,
    },
  ],
});

BunRuntime.runMain(program);
