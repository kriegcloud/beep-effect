/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: mapEntries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.283Z
 *
 * Overview:
 * Maps entries of a `ReadonlyRecord` using the provided function, allowing modification of both keys and corresponding values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.mapEntries({ a: 3, b: 5 }, (a, key) => [key.toUpperCase(), a + 1]),
 *   { A: 4, B: 6 }
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
const exportName = "mapEntries";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Maps entries of a `ReadonlyRecord` using the provided function, allowing modification of both keys and corresponding values.";
const sourceExample =
  'import { Record } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  Record.mapEntries({ a: 3, b: 5 }, (a, key) => [key.toUpperCase(), a + 1]),\n  { A: 4, B: 6 }\n)';
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
