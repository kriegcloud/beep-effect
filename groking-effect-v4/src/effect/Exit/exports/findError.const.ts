/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: findError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:50:36.056Z
 *
 * Overview:
 * Extracts the first typed error value from a failed Exit for use in filter pipelines.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit, Filter } from "effect"
 *
 * const exit = Exit.fail("not found")
 * const result = Exit.findError(exit)
 * // result is "not found"
 *
 * const defect = Exit.die(new Error("bug"))
 * const noError = Exit.findError(defect)
 * // noError is a Filter.fail marker
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findError";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Extracts the first typed error value from a failed Exit for use in filter pipelines.";
const sourceExample =
  'import { Exit, Filter } from "effect"\n\nconst exit = Exit.fail("not found")\nconst result = Exit.findError(exit)\n// result is "not found"\n\nconst defect = Exit.die(new Error("bug"))\nconst noError = Exit.findError(defect)\n// noError is a Filter.fail marker';
const moduleRecord = ExitModule as Record<string, unknown>;

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
