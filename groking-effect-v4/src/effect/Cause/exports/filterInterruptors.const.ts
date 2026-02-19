/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: filterInterruptors
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Extracts the set of interrupting fiber IDs from a cause. Returns `Filter.fail` with the original cause when no {@link Interrupt} reason is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.filterInterruptors(Cause.interrupt(1))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // Set { 1 }
 * }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterInterruptors";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Extracts the set of interrupting fiber IDs from a cause. Returns `Filter.fail` with the original cause when no {@link Interrupt} reason is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.filterInterruptors(Cause.interrupt(1))\nif (!Result.isFailure(result)) {\n  console.log(result.success) // Set { 1 }\n}';
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
