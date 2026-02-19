/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:50:38.644Z
 *
 * Overview:
 * Create an `Equivalence` for records using the provided `Equivalence` for values. Two records are considered equivalent if they have the same keys and their corresponding values are equivalent.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equal, Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const recordEquivalence = Record.makeEquivalence(Equal.asEquivalence<number>())
 *
 * assert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
 * assert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
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
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Create an `Equivalence` for records using the provided `Equivalence` for values. Two records are considered equivalent if they have the same keys and their corresponding values ...";
const sourceExample =
  'import { Equal, Record } from "effect"\nimport * as assert from "node:assert"\n\nconst recordEquivalence = Record.makeEquivalence(Equal.asEquivalence<number>())\n\nassert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 2 }), true)\nassert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 3 }), false)';
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
