/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: isSubrecord
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:50:38.644Z
 *
 * Overview:
 * Check if one record is a subrecord of another, meaning it contains all the keys and values found in the second record. This comparison uses default equality checks (`Equal.equivalence()`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.isSubrecord({ a: 1 } as Record<string, number>, { a: 1, b: 2 }),
 *   true
 * )
 * assert.deepStrictEqual(
 *   Record.isSubrecord({ a: 1, b: 2 }, { a: 1 } as Record<string, number>),
 *   false
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
const exportName = "isSubrecord";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Check if one record is a subrecord of another, meaning it contains all the keys and values found in the second record. This comparison uses default equality checks (`Equal.equiv...";
const sourceExample =
  'import { Record } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  Record.isSubrecord({ a: 1 } as Record<string, number>, { a: 1, b: 2 }),\n  true\n)\nassert.deepStrictEqual(\n  Record.isSubrecord({ a: 1, b: 2 }, { a: 1 } as Record<string, number>),\n  false\n)';
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
