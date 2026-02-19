/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isInterruptedOnly
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T00:00:00.000Z
 *
 * Overview:
 * Compatibility note: `Cause.isInterruptedOnly` is not exported in the current module.
 * Use `Cause.hasInterruptsOnly` for the documented "all reasons are Interrupt" predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true
 * console.log(Cause.hasInterruptsOnly(Cause.fail("error")))  // false
 * console.log(Cause.hasInterruptsOnly(Cause.empty))           // false
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
const exportName = "isInterruptedOnly";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  'Compatibility note: `Cause.isInterruptedOnly` is not exported in the current module. Use `Cause.hasInterruptsOnly` for the documented "all reasons are Interrupt" predicate.';
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true\nconsole.log(Cause.hasInterruptsOnly(Cause.fail("error")))  // false\nconsole.log(Cause.hasInterruptsOnly(Cause.empty))           // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isInterruptedOnly as a compatibility target in effect/Cause.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleLegacyExportStatus = Effect.gen(function* () {
  const hasLegacyExport = Object.prototype.hasOwnProperty.call(moduleRecord, exportName);

  yield* Console.log(`isInterruptedOnly exported: ${hasLegacyExport}`);
  yield* Console.log(`hasInterruptsOnly exported: ${typeof CauseModule.hasInterruptsOnly === "function"}`);

  if (!hasLegacyExport) {
    yield* Console.log("Contract note: use hasInterruptsOnly as the current public predicate.");
  }
});

const exampleSourceAlignedPredicateBehavior = Effect.gen(function* () {
  const interruptCause = CauseModule.interrupt(123);
  const failCause = CauseModule.fail("error");
  const emptyCause = CauseModule.empty;
  const allInterrupts = CauseModule.combine(CauseModule.interrupt(1), CauseModule.interrupt(2));
  const mixed = CauseModule.combine(allInterrupts, CauseModule.fail("boom"));
  const emptyResult = CauseModule.hasInterruptsOnly(emptyCause);

  yield* Console.log(`hasInterruptsOnly(interrupt): ${CauseModule.hasInterruptsOnly(interruptCause)}`);
  yield* Console.log(`hasInterruptsOnly(fail): ${CauseModule.hasInterruptsOnly(failCause)}`);
  yield* Console.log(`hasInterruptsOnly(empty): ${emptyResult}`);
  yield* Console.log(`hasInterruptsOnly(interrupt + interrupt): ${CauseModule.hasInterruptsOnly(allInterrupts)}`);
  yield* Console.log(`hasInterruptsOnly(interrupt + fail): ${CauseModule.hasInterruptsOnly(mixed)}`);

  if (emptyResult !== false) {
    yield* Console.log("Contract note: JSDoc shows empty as false, but runtime currently returns true.");
  }
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
      title: "Legacy Export Status",
      description: "Show whether isInterruptedOnly exists and identify the current replacement export.",
      run: exampleLegacyExportStatus,
    },
    {
      title: "Source-Aligned Predicate Behavior",
      description: "Run hasInterruptsOnly with documented and mixed inputs to demonstrate current behavior.",
      run: exampleSourceAlignedPredicateBehavior,
    },
  ],
});

BunRuntime.runMain(program);
