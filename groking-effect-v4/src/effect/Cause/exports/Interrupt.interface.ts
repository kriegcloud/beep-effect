/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Interrupt
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * A fiber interruption signal, optionally carrying the ID of the fiber that initiated the interruption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.interrupt(123)
 * const reason = cause.reasons[0]
 * if (Cause.isInterruptReason(reason)) {
 *   console.log(reason.fiberId) // 123
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
const exportName = "Interrupt";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "A fiber interruption signal, optionally carrying the ID of the fiber that initiated the interruption.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.interrupt(123)\nconst reason = cause.reasons[0]\nif (Cause.isInterruptReason(reason)) {\n  console.log(reason.fiberId) // 123\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeErasureAndCompanionContext = Effect.gen(function* () {
  yield* Console.log("Interrupt is compile-time only; runtime behavior lives in companion APIs.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });

  yield* Console.log("Inspecting runtime companion constructor: Cause.interrupt.");
  yield* inspectNamedExport({ moduleRecord, exportName: "interrupt" });

  yield* Console.log("Inspecting runtime companion guard: Cause.isInterruptReason.");
  yield* inspectNamedExport({ moduleRecord, exportName: "isInterruptReason" });
});

const exampleInterruptRuntimeFlow = Effect.gen(function* () {
  const withFiberId = CauseModule.interrupt(123);
  const withFiberIdReason = withFiberId.reasons[0];
  yield* Console.log(`Cause.interrupt(123) created ${withFiberId.reasons.length} reason.`);

  if (withFiberIdReason !== undefined && CauseModule.isInterruptReason(withFiberIdReason)) {
    yield* Console.log(`Narrowed interrupt reason fiberId: ${String(withFiberIdReason.fiberId)}`);
  } else {
    yield* Console.log("First reason did not match Cause.isInterruptReason.");
  }

  const withoutFiberId = CauseModule.interrupt();
  const withoutFiberIdReason = withoutFiberId.reasons[0];
  if (withoutFiberIdReason !== undefined && CauseModule.isInterruptReason(withoutFiberIdReason)) {
    yield* Console.log(
      `Cause.interrupt() stores fiberId: ${
        withoutFiberIdReason.fiberId === undefined ? "undefined" : String(withoutFiberIdReason.fiberId)
      }`
    );
  }
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
      description: "Show interface erasure and inspect `Cause.interrupt` and `Cause.isInterruptReason` companions.",
      run: exampleTypeErasureAndCompanionContext,
    },
    {
      title: "Cause.interrupt Runtime Flow",
      description: "Create interrupt causes and read `fiberId` after narrowing with `Cause.isInterruptReason`.",
      run: exampleInterruptRuntimeFlow,
    },
  ],
});

BunRuntime.runMain(program);
