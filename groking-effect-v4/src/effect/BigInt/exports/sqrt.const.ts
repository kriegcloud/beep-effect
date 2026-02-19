/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: sqrt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:50:32.921Z
 *
 * Overview:
 * Determines the square root of a given `bigint` safely. Returns `undefined` if the given `bigint` is negative.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigInt } from "effect"
 *
 * BigInt.sqrt(4n) // 2n
 * BigInt.sqrt(9n) // 3n
 * BigInt.sqrt(16n) // 4n
 * BigInt.sqrt(-1n) // undefined
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
const exportName = "sqrt";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary =
  "Determines the square root of a given `bigint` safely. Returns `undefined` if the given `bigint` is negative.";
const sourceExample =
  'import { BigInt } from "effect"\n\nBigInt.sqrt(4n) // 2n\nBigInt.sqrt(9n) // 3n\nBigInt.sqrt(16n) // 4n\nBigInt.sqrt(-1n) // undefined';
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
