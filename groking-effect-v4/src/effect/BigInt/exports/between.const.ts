/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: between
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:50:32.919Z
 *
 * Overview:
 * Checks if a `bigint` is between a `minimum` and `maximum` value (inclusive).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as BigInt from "effect/BigInt"
 * import * as assert from "node:assert"
 *
 * const between = BigInt.between({ minimum: 0n, maximum: 5n })
 *
 * assert.deepStrictEqual(between(3n), true)
 * assert.deepStrictEqual(between(-1n), false)
 * assert.deepStrictEqual(between(6n), false)
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
import * as BigIntModule from "effect/BigInt";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "between";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Checks if a `bigint` is between a `minimum` and `maximum` value (inclusive).";
const sourceExample =
  'import * as BigInt from "effect/BigInt"\nimport * as assert from "node:assert"\n\nconst between = BigInt.between({ minimum: 0n, maximum: 5n })\n\nassert.deepStrictEqual(between(3n), true)\nassert.deepStrictEqual(between(-1n), false)\nassert.deepStrictEqual(between(6n), false)';
const moduleRecord = BigIntModule as Record<string, unknown>;

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
