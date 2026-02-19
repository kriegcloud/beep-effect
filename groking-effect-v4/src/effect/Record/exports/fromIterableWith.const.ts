/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: fromIterableWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:50:38.644Z
 *
 * Overview:
 * Takes an iterable and a projection function and returns a record. The projection function maps each value of the iterable to a tuple of a key and a value, which is then added to the resulting record.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const input = [1, 2, 3, 4]
 *
 * assert.deepStrictEqual(
 *   Record.fromIterableWith(input, (a) => [String(a), a * 2]),
 *   { "1": 2, "2": 4, "3": 6, "4": 8 }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RecordModule from "effect/Record";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromIterableWith";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Takes an iterable and a projection function and returns a record. The projection function maps each value of the iterable to a tuple of a key and a value, which is then added to...";
const sourceExample =
  'import { Record } from "effect"\nimport * as assert from "node:assert"\n\nconst input = [1, 2, 3, 4]\n\nassert.deepStrictEqual(\n  Record.fromIterableWith(input, (a) => [String(a), a * 2]),\n  { "1": 2, "2": 4, "3": 6, "4": 8 }\n)';
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
