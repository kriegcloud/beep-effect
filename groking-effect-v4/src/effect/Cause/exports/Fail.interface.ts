/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Fail
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * A typed, expected error produced by `Effect.fail`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("Something went wrong")
 * const reason = cause.reasons[0]
 * if (Cause.isFailReason(reason)) {
 *   console.log(reason.error) // "Something went wrong"
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
const exportName = "Fail";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A typed, expected error produced by `Effect.fail`.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail("Something went wrong")\nconst reason = cause.reasons[0]\nif (Cause.isFailReason(reason)) {\n  console.log(reason.error) // "Something went wrong"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeErasureAndCompanionContext = Effect.gen(function* () {
  yield* Console.log("Fail is compile-time only; runtime behavior lives in companion APIs.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });

  yield* Console.log("Inspecting the runtime companion constructor: Cause.fail.");
  yield* inspectNamedExport({ moduleRecord, exportName: "fail" });
});

const exampleFailRuntimeFlow = Effect.gen(function* () {
  const cause = CauseModule.fail("Something went wrong");
  const firstReason = cause.reasons[0];

  yield* Console.log(`Constructed cause with ${cause.reasons.length} reason(s).`);

  if (firstReason !== undefined && CauseModule.isFailReason(firstReason)) {
    yield* Console.log(`First reason is Fail; error: ${String(firstReason.error)}`);
    return;
  }

  yield* Console.log("First reason did not match Cause.isFailReason.");
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
      description: "Show erasure at runtime, then inspect the `Cause.fail` companion API.",
      run: exampleTypeErasureAndCompanionContext,
    },
    {
      title: "Cause.fail Runtime Flow",
      description: "Create a fail cause and verify its first reason with `Cause.isFailReason`.",
      run: exampleFailRuntimeFlow,
    },
  ],
});

BunRuntime.runMain(program);
