/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: fromRecord
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Takes a record and returns an Iterable of tuples containing its keys and values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { fromRecord } from "effect/Iterable"
 * import * as assert from "node:assert"
 *
 * const x = { a: 1, b: 2, c: 3 }
 * assert.deepStrictEqual(Array.from(fromRecord(x)), [["a", 1], ["b", 2], [
 *   "c",
 *   3
 * ]])
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromRecord";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Takes a record and returns an Iterable of tuples containing its keys and values.";
const sourceExample =
  'import { fromRecord } from "effect/Iterable"\nimport * as assert from "node:assert"\n\nconst x = { a: 1, b: 2, c: 3 }\nassert.deepStrictEqual(Array.from(fromRecord(x)), [["a", 1], ["b", 2], [\n  "c",\n  3\n]])';
const moduleRecord = IterableModule as Record<string, unknown>;

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
