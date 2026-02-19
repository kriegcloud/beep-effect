/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: interruptors
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.144Z
 *
 * Overview:
 * Collects the fiber IDs of all {@link Interrupt} reasons in the cause into a `ReadonlySet`. Returns an empty set when the cause has no interrupts.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.combine(
 *   Cause.interrupt(1),
 *   Cause.interrupt(2)
 * )
 * console.log(Cause.interruptors(cause)) // Set { 1, 2 }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interruptors";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Collects the fiber IDs of all {@link Interrupt} reasons in the cause into a `ReadonlySet`. Returns an empty set when the cause has no interrupts.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.combine(\n  Cause.interrupt(1),\n  Cause.interrupt(2)\n)\nconsole.log(Cause.interruptors(cause)) // Set { 1, 2 }';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
