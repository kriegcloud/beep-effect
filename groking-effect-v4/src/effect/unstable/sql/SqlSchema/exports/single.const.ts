/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/sql/SqlSchema
 * Export: single
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/sql/SqlSchema.ts
 * Generated: 2026-02-19T04:50:52.505Z
 *
 * Overview:
 * Run a sql query with a request schema and a result schema and return the first result.
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
import * as SqlSchemaModule from "effect/unstable/sql/SqlSchema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "single";
const exportKind = "const";
const moduleImportPath = "effect/unstable/sql/SqlSchema";
const sourceSummary = "Run a sql query with a request schema and a result schema and return the first result.";
const sourceExample = "";
const moduleRecord = SqlSchemaModule as Record<string, unknown>;

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
