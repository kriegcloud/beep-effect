/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: between
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:50:37.938Z
 *
 * Overview:
 * Checks if a `number` is between a `minimum` and `maximum` value (inclusive).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Number from "effect/Number"
 * import * as assert from "node:assert"
 *
 * const between = Number.between({ minimum: 0, maximum: 5 })
 *
 * assert.deepStrictEqual(between(3), true)
 * assert.deepStrictEqual(between(-1), false)
 * assert.deepStrictEqual(between(6), false)
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
import * as NumberModule from "effect/Number";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "between";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary = "Checks if a `number` is between a `minimum` and `maximum` value (inclusive).";
const sourceExample =
  'import * as Number from "effect/Number"\nimport * as assert from "node:assert"\n\nconst between = Number.between({ minimum: 0, maximum: 5 })\n\nassert.deepStrictEqual(between(3), true)\nassert.deepStrictEqual(between(-1), false)\nassert.deepStrictEqual(between(6), false)';
const moduleRecord = NumberModule as Record<string, unknown>;

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
