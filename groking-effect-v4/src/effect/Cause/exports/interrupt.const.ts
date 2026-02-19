/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: interrupt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Creates a {@link Cause} containing a single {@link Interrupt} reason, optionally carrying the interrupting fiber's ID.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.interrupt(123)
 * console.log(cause.reasons.length) // 1
 * console.log(Cause.isInterruptReason(cause.reasons[0])) // true
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interrupt";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Creates a {@link Cause} containing a single {@link Interrupt} reason, optionally carrying the interrupting fiber's ID.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.interrupt(123)\nconsole.log(cause.reasons.length) // 1\nconsole.log(Cause.isInterruptReason(cause.reasons[0])) // true';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect interrupt as a callable constructor for interrupt-only causes.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInterruptCause = Effect.gen(function* () {
  const cause = CauseModule.interrupt(123);
  const firstReason = cause.reasons[0];

  yield* Console.log(`reasons.length: ${cause.reasons.length}`);
  if (firstReason === undefined) {
    yield* Console.log("first reason missing (unexpected for Cause.interrupt)");
    return;
  }

  yield* Console.log(`reason _tag: ${firstReason._tag}`);
  yield* Console.log(`isInterruptReason(reasons[0]): ${CauseModule.isInterruptReason(firstReason)}`);
  if (CauseModule.isInterruptReason(firstReason)) {
    yield* Console.log(`reason fiberId: ${String(firstReason.fiberId)}`);
  }
});

const exampleOptionalFiberId = Effect.gen(function* () {
  const withId = CauseModule.interrupt(7);
  const withoutId = CauseModule.interrupt();
  const withIdReason = withId.reasons[0];
  const withoutIdReason = withoutId.reasons[0];

  if (withIdReason !== undefined && CauseModule.isInterruptReason(withIdReason)) {
    yield* Console.log(`with explicit id -> fiberId: ${String(withIdReason.fiberId)}`);
  }
  if (withoutIdReason !== undefined && CauseModule.isInterruptReason(withoutIdReason)) {
    yield* Console.log(`without id -> fiberId: ${String(withoutIdReason.fiberId)}`);
  }
  yield* Console.log(`hasInterrupts(with explicit id): ${CauseModule.hasInterrupts(withId)}`);
  yield* Console.log(`hasInterrupts(without id): ${CauseModule.hasInterrupts(withoutId)}`);
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
      title: "Source-Aligned Interrupt Cause",
      description: "Create an interrupt cause and verify it contains one Interrupt reason with the provided fiber id.",
      run: exampleSourceAlignedInterruptCause,
    },
    {
      title: "Optional Fiber Id Behavior",
      description: "Compare interrupt causes created with and without a fiber id argument.",
      run: exampleOptionalFiberId,
    },
  ],
});

BunRuntime.runMain(program);
