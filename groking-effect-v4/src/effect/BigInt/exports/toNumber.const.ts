/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: toNumber
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:50:32.921Z
 *
 * Overview:
 * Converts a `bigint` to a `number`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigInt as BI } from "effect"
 *
 * BI.toNumber(42n) // 42
 * BI.toNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n) // undefined
 * BI.toNumber(BigInt(Number.MIN_SAFE_INTEGER) - 1n) // undefined
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
const exportName = "toNumber";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Converts a `bigint` to a `number`.";
const sourceExample =
  'import { BigInt as BI } from "effect"\n\nBI.toNumber(42n) // 42\nBI.toNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n) // undefined\nBI.toNumber(BigInt(Number.MIN_SAFE_INTEGER) - 1n) // undefined';
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
