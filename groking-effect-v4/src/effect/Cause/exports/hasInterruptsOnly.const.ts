/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: hasInterruptsOnly
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Returns `true` if every reason in the cause is an {@link Interrupt} (and there is at least one reason).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true
 * console.log(Cause.hasInterruptsOnly(Cause.fail("error")))  // false
 * console.log(Cause.hasInterruptsOnly(Cause.empty))          // false
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
const exportName = "hasInterruptsOnly";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns `true` if every reason in the cause is an {@link Interrupt} (and there is at least one reason).";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true\nconsole.log(Cause.hasInterruptsOnly(Cause.fail("error")))  // false\nconsole.log(Cause.hasInterruptsOnly(Cause.empty))          // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect hasInterruptsOnly as a predicate over Cause values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInterruptFailEmpty = Effect.gen(function* () {
  const interruptCause = CauseModule.interrupt(123);
  const failCause = CauseModule.fail("error");
  const emptyCause = CauseModule.empty;
  const emptyResult = CauseModule.hasInterruptsOnly(emptyCause);

  yield* Console.log(`hasInterruptsOnly(interrupt): ${CauseModule.hasInterruptsOnly(interruptCause)}`);
  yield* Console.log(`hasInterruptsOnly(fail): ${CauseModule.hasInterruptsOnly(failCause)}`);
  yield* Console.log(`hasInterruptsOnly(empty): ${emptyResult}`);

  if (emptyResult !== false) {
    yield* Console.log("Contract note: docs say empty should be false; current runtime evaluates it as true.");
  }
});

const exampleAllInterruptsVsMixedReasons = Effect.gen(function* () {
  const allInterrupts = CauseModule.combine(CauseModule.interrupt(1), CauseModule.interrupt(2));
  const interruptAndFail = CauseModule.combine(allInterrupts, CauseModule.fail("boom"));
  const interruptAndDie = CauseModule.combine(allInterrupts, CauseModule.die("defect"));

  yield* Console.log(`hasInterruptsOnly(interrupt + interrupt): ${CauseModule.hasInterruptsOnly(allInterrupts)}`);
  yield* Console.log(`hasInterruptsOnly(interrupt + fail): ${CauseModule.hasInterruptsOnly(interruptAndFail)}`);
  yield* Console.log(`hasInterruptsOnly(interrupt + die): ${CauseModule.hasInterruptsOnly(interruptAndDie)}`);
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
      title: "Source-Aligned Inputs + Empty Contract Note",
      description: "Run documented inputs and call out that current runtime treats empty as true.",
      run: exampleSourceAlignedInterruptFailEmpty,
    },
    {
      title: "All Interrupts Vs Mixed Reasons",
      description: "Show combined causes stay true only when every reason is an Interrupt.",
      run: exampleAllInterruptsVsMixedReasons,
    },
  ],
});

BunRuntime.runMain(program);
