/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Tests if an arbitrary value is a {@link Reason} (`Fail`, `Die`, or `Interrupt`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.fail("error").reasons[0]
 * console.log(Cause.isReason(reason)) // true
 * console.log(Cause.isReason("not a reason")) // false
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
const exportName = "isReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is a {@link Reason} (`Fail`, `Die`, or `Interrupt`).";
const sourceExample =
  'import { Cause } from "effect"\n\nconst reason = Cause.fail("error").reasons[0]\nconsole.log(Cause.isReason(reason)) // true\nconsole.log(Cause.isReason("not a reason")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isReason as a runtime guard for reason values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`Guard arity: ${CauseModule.isReason.length}`);
});

const exampleSourceAlignedGuardChecks = Effect.gen(function* () {
  const reason = CauseModule.fail("error").reasons[0];

  yield* Console.log(`reason tag: ${reason?._tag ?? "(none)"}`);
  yield* Console.log(`isReason(cause.reasons[0]): ${CauseModule.isReason(reason)}`);
  yield* Console.log(`isReason("not a reason"): ${CauseModule.isReason("not a reason")}`);
});

const exampleMixedReasonCandidates = Effect.gen(function* () {
  const failReason = CauseModule.makeFailReason("bad input");
  const dieReason = CauseModule.makeDieReason(new Error("defect"));
  const interruptReason = CauseModule.makeInterruptReason(7);
  const cause = CauseModule.fail("bad input");
  const brandedLookalike = {
    _tag: "Fail",
    error: "bad input",
    [CauseModule.ReasonTypeId]: CauseModule.ReasonTypeId,
  };
  const unbrandedLookalike = { _tag: "Fail", error: "bad input" };

  const candidates: Array<{ readonly label: string; readonly value: unknown }> = [
    { label: 'Cause.makeFailReason("bad input")', value: failReason },
    { label: 'Cause.makeDieReason(new Error("defect"))', value: dieReason },
    { label: "Cause.makeInterruptReason(7)", value: interruptReason },
    { label: 'Cause.fail("bad input")', value: cause },
    { label: "branded plain object", value: brandedLookalike },
    { label: "unbranded plain object", value: unbrandedLookalike },
  ];

  for (const candidate of candidates) {
    yield* Console.log(`isReason(${candidate.label}): ${CauseModule.isReason(candidate.value)}`);
  }
  yield* Console.log("Contract note: prefer Cause constructors over structural lookalikes.");
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
      description: "Inspect module export count, runtime type, preview, and function arity.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Guard Checks",
      description: "Run the documented reason and non-reason inputs to show true vs false behavior.",
      run: exampleSourceAlignedGuardChecks,
    },
    {
      title: "Mixed Reason Candidates",
      description: "Check real reason variants, a Cause value, and structural objects through the guard.",
      run: exampleMixedReasonCandidates,
    },
  ],
});

BunRuntime.runMain(program);
