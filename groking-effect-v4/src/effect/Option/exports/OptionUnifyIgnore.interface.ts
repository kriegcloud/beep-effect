/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: OptionUnifyIgnore
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Internal interface for type unification ignore behavior.
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
import * as OptionModule from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "OptionUnifyIgnore";
const exportKind = "interface";
const moduleImportPath = "effect/Option";
const sourceSummary = "Internal interface for type unification ignore behavior.";
const sourceExample = "";
const moduleRecord = OptionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`OptionUnifyIgnore` is compile-time only and erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionExportInspection = Effect.gen(function* () {
  yield* Console.log("Bridge to runtime: inspect `andThen`, where Option result shapes are combined.");
  yield* inspectNamedExport({ moduleRecord, exportName: "andThen" });
});

const exampleUnificationCompanionFlow = Effect.gen(function* () {
  const seed = OptionModule.some(5);
  const doubled = OptionModule.andThen(seed, (value) => OptionModule.some(value * 2));
  const replacedWithLiteral = OptionModule.andThen(seed, "ready");
  const skippedBecauseNone = OptionModule.andThen(OptionModule.none<number>(), (value) => OptionModule.some(value * 2));

  const doubledMessage = OptionModule.match(doubled, {
    onNone: () => "None",
    onSome: (value) => `Some(${value})`,
  });
  const replacedMessage = OptionModule.match(replacedWithLiteral, {
    onNone: () => "None",
    onSome: (value) => `Some(${value})`,
  });
  const skippedMessage = OptionModule.match(skippedBecauseNone, {
    onNone: () => "None",
    onSome: (value) => `Some(${value})`,
  });

  yield* Console.log(
    "Bridge: this interface guides compile-time unification rules; runtime behavior comes from Option combinators."
  );
  yield* Console.log(`andThen(Some(5), value => Some(value * 2)) -> ${doubledMessage}`);
  yield* Console.log(`andThen(Some(5), "ready") -> ${replacedMessage}`);
  yield* Console.log(`andThen(None, value => Some(value * 2)) -> ${skippedMessage}`);
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
      description: "Inspect the runtime `andThen` companion API related to Option result unification behavior.",
      run: exampleCompanionExportInspection,
    },
    {
      title: "Companion API Flow",
      description: "Run `andThen` with Option-returning, value, and `None` inputs to show runtime outcomes.",
      run: exampleUnificationCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
