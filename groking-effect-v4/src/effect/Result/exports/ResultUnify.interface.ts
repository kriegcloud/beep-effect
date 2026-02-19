/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: ResultUnify
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Type-level utility for unifying `Result` types in generic contexts.
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
const exportName = "ResultUnify";
const exportKind = "interface";
const moduleImportPath = "effect/Result";
const sourceSummary = "Type-level utility for unifying `Result` types in generic contexts.";
const sourceExample = "";
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("ResultUnify is a compile-time interface; confirm runtime erasure.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionRuntimeFlow = Effect.gen(function* () {
  yield* Console.log("Bridge: runtime composition uses Result APIs such as Result.all.");
  yield* inspectNamedExport({ moduleRecord, exportName: "all" });

  const tupleResult = ResultModule.all([ResultModule.succeed(1), ResultModule.succeed("two")]);
  const structResult = ResultModule.all({
    id: ResultModule.succeed(1),
    enabled: ResultModule.succeed(true),
  });
  const shortCircuitResult = ResultModule.all({
    first: ResultModule.succeed("ready"),
    second: ResultModule.fail("boom"),
    third: ResultModule.succeed("skipped"),
  });

  const describe = <A, E>(result: ResultModule.Result<A, E>): string =>
    ResultModule.match(result, {
      onSuccess: (value) => `Success: ${JSON.stringify(value)}`,
      onFailure: (error) => `Failure: ${String(error)}`,
    });

  yield* Console.log(`tuple -> ${describe(tupleResult)}`);
  yield* Console.log(`struct -> ${describe(structResult)}`);
  yield* Console.log(`short-circuit -> ${describe(shortCircuitResult)}`);
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
      title: "Companion API Flow",
      description: "Compose multiple Result values and observe success/failure collection.",
      run: exampleCompanionRuntimeFlow,
    },
  ],
});

BunRuntime.runMain(program);
