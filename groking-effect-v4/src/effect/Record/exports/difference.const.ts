/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: difference
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.282Z
 *
 * Overview:
 * Merge two records, preserving only the entries that are unique to each record. Keys that exist in both records are excluded from the result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.difference({ a: 1, b: 2 }, { b: 3, c: 4 }),
 *   { a: 1, c: 4 }
 * )
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RecordModule from "effect/Record";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "difference";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Merge two records, preserving only the entries that are unique to each record. Keys that exist in both records are excluded from the result.";
const sourceExample =
  'import { Record } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  Record.difference({ a: 1, b: 2 }, { b: 3, c: 4 }),\n  { a: 1, c: 4 }\n)';
const moduleRecord = RecordModule as Record<string, unknown>;

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
