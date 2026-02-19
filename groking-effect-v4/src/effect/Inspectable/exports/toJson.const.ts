/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Inspectable
 * Export: toJson
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Inspectable.ts
 * Generated: 2026-02-19T04:50:37.095Z
 *
 * Overview:
 * Safely converts a value to a JSON-serializable representation, useful for implementing the `toJSON` method of the {@link Inspectable} interface.
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
import * as InspectableModule from "effect/Inspectable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toJson";
const exportKind = "const";
const moduleImportPath = "effect/Inspectable";
const sourceSummary =
  "Safely converts a value to a JSON-serializable representation, useful for implementing the `toJSON` method of the {@link Inspectable} interface.";
const sourceExample = "";
const moduleRecord = InspectableModule as Record<string, unknown>;

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
