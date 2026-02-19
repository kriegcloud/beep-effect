/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/workflow/Workflow
 * Export: withCompensation
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/workflow/Workflow.ts
 * Generated: 2026-02-19T04:50:53.269Z
 *
 * Overview:
 * Add compensation logic to an effect inside a Workflow. The compensation finalizer will be called if the entire workflow fails, allowing you to perform cleanup or other actions based on the success value and the cause of the workflow failure.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as WorkflowModule from "effect/unstable/workflow/Workflow";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withCompensation";
const exportKind = "const";
const moduleImportPath = "effect/unstable/workflow/Workflow";
const sourceSummary =
  "Add compensation logic to an effect inside a Workflow. The compensation finalizer will be called if the entire workflow fails, allowing you to perform cleanup or other actions b...";
const sourceExample = "";
const moduleRecord = WorkflowModule as Record<string, unknown>;

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
