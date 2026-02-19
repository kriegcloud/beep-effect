/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: ResultUnifyIgnore
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Marker interface for ignoring unification in `Result` types.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ResultUnifyIgnore";
const exportKind = "interface";
const moduleImportPath = "effect/Result";
const sourceSummary = "Marker interface for ignoring unification in `Result` types.";
const sourceExample = "";
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`ResultUnifyIgnore` is compile-time only and erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionExportInspection = Effect.gen(function* () {
  yield* Console.log("Bridge to runtime: inspect `andThen`, where Result values are unified by shape.");
  yield* inspectNamedExport({ moduleRecord, exportName: "andThen" });
});

const exampleUnificationCompanionFlow = Effect.gen(function* () {
  const seed = ResultModule.succeed(1);
  const chainedResult = ResultModule.andThen(seed, (value) => ResultModule.succeed(value + 1));
  const mappedValue = ResultModule.andThen(seed, (value) => value + 1);
  const replacedWithLiteral = ResultModule.andThen(seed, "done");
  const shortCircuited = ResultModule.andThen(ResultModule.fail("boom"), (value: number) =>
    ResultModule.succeed(value + 1)
  );

  const describe = (result: ResultModule.Result<number | string, string>): string =>
    ResultModule.match(result, {
      onSuccess: (value) => `Success(${value})`,
      onFailure: (error) => `Failure(${error})`,
    });

  yield* Console.log(
    "Bridge: this interface controls compile-time unification; runtime behavior is shown via Result combinators."
  );
  yield* Console.log(`andThen(Success(1), n => Success(n + 1)) -> ${describe(chainedResult)}`);
  yield* Console.log(`andThen(Success(1), n => n + 1) -> ${describe(mappedValue)}`);
  yield* Console.log(`andThen(Success(1), "done") -> ${describe(replacedWithLiteral)}`);
  yield* Console.log(`andThen(Failure("boom"), n => Success(n + 1)) -> ${describe(shortCircuited)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Companion Export Inspection",
      description: "Inspect the runtime `andThen` companion API related to Result unification behavior.",
      run: exampleCompanionExportInspection,
    },
    {
      title: "Companion API Flow",
      description: "Run `andThen` with Result-returning, value, and Failure inputs to show runtime outcomes.",
      run: exampleUnificationCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
