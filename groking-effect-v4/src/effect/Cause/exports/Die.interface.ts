/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Die
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * An untyped defect — typically a programming error or an uncaught exception.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.die(new Error("Unexpected"))
 * const reason = cause.reasons[0]
 * if (Cause.isDieReason(reason)) {
 *   console.log(reason.defect) // Error: Unexpected
 * }
 * ```
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
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Die";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "An untyped defect — typically a programming error or an uncaught exception.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.die(new Error("Unexpected"))\nconst reason = cause.reasons[0]\nif (Cause.isDieReason(reason)) {\n  console.log(reason.defect) // Error: Unexpected\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeErasureAndCompanionContext = Effect.gen(function* () {
  yield* Console.log("Die is compile-time only; runtime behavior lives in companion APIs.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });

  yield* Console.log("Inspecting the runtime companion constructor: Cause.die.");
  yield* inspectNamedExport({ moduleRecord, exportName: "die" });
});

const exampleDieRuntimeFlow = Effect.gen(function* () {
  const cause = CauseModule.die(new Error("Unexpected"));
  const firstReason = cause.reasons[0];

  yield* Console.log(`Constructed cause with ${cause.reasons.length} reason(s).`);

  if (firstReason !== undefined && CauseModule.isDieReason(firstReason)) {
    const defect = firstReason.defect;
    const defectMessage = defect instanceof Error ? defect.message : String(defect);
    yield* Console.log(`First reason is Die; defect message: ${defectMessage}`);
    return;
  }

  yield* Console.log("First reason did not match Cause.isDieReason.");
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
      title: "Type Erasure + Companion Context",
      description: "Show erasure at runtime, then inspect the `Cause.die` companion API.",
      run: exampleTypeErasureAndCompanionContext,
    },
    {
      title: "Cause.die Runtime Flow",
      description: "Create a die cause and verify its first reason with `Cause.isDieReason`.",
      run: exampleDieRuntimeFlow,
    },
  ],
});

BunRuntime.runMain(program);
