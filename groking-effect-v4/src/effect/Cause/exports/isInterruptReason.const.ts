/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isInterruptReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Narrows a {@link Reason} to {@link Interrupt}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.interrupt(123)
 * const interrupts = cause.reasons.filter(Cause.isInterruptReason)
 * console.log(interrupts[0].fiberId) // 123
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
const exportName = "isInterruptReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Narrows a {@link Reason} to {@link Interrupt}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.interrupt(123)\nconst interrupts = cause.reasons.filter(Cause.isInterruptReason)\nconsole.log(interrupts[0].fiberId) // 123';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isInterruptReason as a reason-level narrowing predicate.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedReasonFiltering = Effect.gen(function* () {
  yield* Console.log("Filter an interrupt cause's reasons with isInterruptReason.");
  const cause = CauseModule.interrupt(123);
  const interrupts = cause.reasons.filter(CauseModule.isInterruptReason);
  const firstInterrupt = interrupts[0];

  yield* Console.log(`reason count: ${cause.reasons.length}`);
  yield* Console.log(`interrupt count: ${interrupts.length}`);
  yield* Console.log(`first fiberId: ${firstInterrupt === undefined ? "(none)" : String(firstInterrupt.fiberId)}`);
});

const exampleMixedReasonFiltering = Effect.gen(function* () {
  yield* Console.log("Retain only Interrupt reasons from a mixed cause.");
  const mixedCause = CauseModule.combine(
    CauseModule.combine(CauseModule.fail("validation-error"), CauseModule.interrupt(7)),
    CauseModule.combine(CauseModule.die("panic"), CauseModule.interrupt())
  );
  const interrupts = mixedCause.reasons.filter(CauseModule.isInterruptReason);
  const fiberIds = interrupts
    .map((reason) => (reason.fiberId === undefined ? "undefined" : String(reason.fiberId)))
    .join(", ");

  yield* Console.log(`all tags: ${mixedCause.reasons.map((reason) => reason._tag).join(", ")}`);
  yield* Console.log(`interrupt count: ${interrupts.length}`);
  yield* Console.log(`interrupt fiberIds: ${fiberIds || "(none)"}`);
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
      title: "Source-Aligned Interrupt Filtering",
      description: "Reproduce the documented flow by filtering an interrupt cause and reading the narrowed fiber id.",
      run: exampleSourceAlignedReasonFiltering,
    },
    {
      title: "Mixed Reason Filtering",
      description: "Apply isInterruptReason to a combined cause containing fail, die, and interrupt reasons.",
      run: exampleMixedReasonFiltering,
    },
  ],
});

BunRuntime.runMain(program);
