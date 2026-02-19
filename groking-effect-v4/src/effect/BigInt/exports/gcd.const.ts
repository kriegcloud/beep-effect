/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: gcd
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:14:10.085Z
 *
 * Overview:
 * Determines the greatest common divisor of two `bigint`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { gcd } from "effect/BigInt"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(gcd(2n, 3n), 1n)
 * assert.deepStrictEqual(gcd(2n, 4n), 2n)
 * assert.deepStrictEqual(gcd(16n, 24n), 8n)
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
import * as BigIntModule from "effect/BigInt";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "gcd";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Determines the greatest common divisor of two `bigint`s.";
const sourceExample =
  'import { gcd } from "effect/BigInt"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(gcd(2n, 3n), 1n)\nassert.deepStrictEqual(gcd(2n, 4n), 2n)\nassert.deepStrictEqual(gcd(16n, 24n), 8n)';
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
