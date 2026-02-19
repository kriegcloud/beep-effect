/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Boolean
 * Export: xor
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Boolean.ts
 * Generated: 2026-02-19T04:50:32.945Z
 *
 * Overview:
 * Combines two booleans using XOR: `(!self && that) || (self && !that)`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { xor } from "effect/Boolean"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(xor(true, true), false)
 * assert.deepStrictEqual(xor(true, false), true)
 * assert.deepStrictEqual(xor(false, true), true)
 * assert.deepStrictEqual(xor(false, false), false)
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
import * as BooleanModule from "effect/Boolean";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "xor";
const exportKind = "const";
const moduleImportPath = "effect/Boolean";
const sourceSummary = "Combines two booleans using XOR: `(!self && that) || (self && !that)`.";
const sourceExample =
  'import { xor } from "effect/Boolean"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(xor(true, true), false)\nassert.deepStrictEqual(xor(true, false), true)\nassert.deepStrictEqual(xor(false, true), true)\nassert.deepStrictEqual(xor(false, false), false)';
const moduleRecord = BooleanModule as Record<string, unknown>;

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
