/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: hasInterrupts
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Returns `true` if the cause contains at least one {@link Interrupt} reason.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasInterrupts(Cause.interrupt(123))) // true
 * console.log(Cause.hasInterrupts(Cause.fail("error")))  // false
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
const exportName = "hasInterrupts";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns `true` if the cause contains at least one {@link Interrupt} reason.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.hasInterrupts(Cause.interrupt(123))) // true\nconsole.log(Cause.hasInterrupts(Cause.fail("error")))  // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect hasInterrupts as a callable predicate over Cause values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedPredicate = Effect.gen(function* () {
  const interruptCause = CauseModule.interrupt(123);
  const failCause = CauseModule.fail("error");

  yield* Console.log(`hasInterrupts(interrupt): ${CauseModule.hasInterrupts(interruptCause)}`);
  yield* Console.log(`hasInterrupts(fail): ${CauseModule.hasInterrupts(failCause)}`);
});

const exampleCombinedCauseDetection = Effect.gen(function* () {
  const causeWithInterrupt = CauseModule.combine(CauseModule.fail("typed-error"), CauseModule.interrupt(7));
  const causeWithoutInterrupt = CauseModule.combine(CauseModule.fail("typed-error"), CauseModule.die("defect"));
  const withInterruptTags = causeWithInterrupt.reasons.map((reason) => reason._tag).join(", ");

  yield* Console.log(`causeWithInterrupt reason tags: ${withInterruptTags}`);
  yield* Console.log(`hasInterrupts(fail + interrupt): ${CauseModule.hasInterrupts(causeWithInterrupt)}`);
  yield* Console.log(`hasInterrupts(fail + die): ${CauseModule.hasInterrupts(causeWithoutInterrupt)}`);
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
      title: "Source-Aligned Interrupt Predicate",
      description: "Reproduce the JSDoc behavior: interrupt causes return true and fail causes return false.",
      run: exampleSourceAlignedPredicate,
    },
    {
      title: "Interrupt Detection In Mixed Causes",
      description:
        "Show that hasInterrupts scans combined causes and only returns true when an Interrupt reason exists.",
      run: exampleCombinedCauseDetection,
    },
  ],
});

BunRuntime.runMain(program);
