/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: ResultTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Higher-kinded type representation for `Result`.
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
const exportName = "ResultTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Result";
const sourceSummary = "Higher-kinded type representation for `Result`.";
const sourceExample = "";
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Bridge note: ResultTypeLambda is erased at runtime; companion Result APIs carry behavior.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match(result, {
    onFailure: (error) => `Failure(${JSON.stringify(error)})`,
    onSuccess: (value) => `Success(${JSON.stringify(value)})`,
  });

const parseNumber = (input: string): ResultModule.Result<number, string> => {
  const parsed = Number(input);
  return Number.isNaN(parsed) ? ResultModule.fail("not a number") : ResultModule.succeed(parsed);
};

const ensurePositive = (value: number): ResultModule.Result<number, string> =>
  value > 0 ? ResultModule.succeed(value) : ResultModule.fail("not positive");

const exampleCompanionFlatMapFlow = Effect.gen(function* () {
  yield* Console.log("Use Result.flatMap to parse then validate numbers.");
  yield* inspectNamedExport({ moduleRecord, exportName: "flatMap" });

  for (const input of ["42", "-3", "oops"]) {
    const validated = ResultModule.flatMap(parseNumber(input), ensurePositive);
    const message = ResultModule.getOrElse(validated, (error) => `Error: ${error}`);
    yield* Console.log(`${input} -> ${message}`);
  }
});

const exampleCompanionDoNotationFlow = Effect.gen(function* () {
  yield* Console.log("Result.Do/bind rely on map/flatMap abstractions modeled by this type lambda.");
  yield* inspectNamedExport({ moduleRecord, exportName: "bind" });

  const highSubtotal = ResultModule.Do.pipe(
    ResultModule.bind("subtotal", () => ResultModule.succeed(120)),
    ResultModule.bind("discount", ({ subtotal }) =>
      subtotal >= 100 ? ResultModule.succeed(15) : ResultModule.fail("discount unavailable")
    ),
    ResultModule.let("total", ({ subtotal, discount }) => subtotal - discount)
  );

  const lowSubtotal = ResultModule.Do.pipe(
    ResultModule.bind("subtotal", () => ResultModule.succeed(60)),
    ResultModule.bind("discount", ({ subtotal }) =>
      subtotal >= 100 ? ResultModule.succeed(15) : ResultModule.fail("discount unavailable")
    ),
    ResultModule.let("total", ({ subtotal, discount }) => subtotal - discount)
  );

  yield* Console.log(`high subtotal -> ${summarizeResult(highSubtotal)}`);
  yield* Console.log(`low subtotal -> ${summarizeResult(lowSubtotal)}`);
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
      title: "Companion flatMap Flow",
      description: "Run parse/validate sequencing with Result.flatMap and fallback rendering.",
      run: exampleCompanionFlatMapFlow,
    },
    {
      title: "Companion Do Notation Flow",
      description: "Use Result.Do and bind/let to show runtime composition tied to this type lambda.",
      run: exampleCompanionDoNotationFlow,
    },
  ],
});

BunRuntime.runMain(program);
