/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: Equivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:14:10.085Z
 *
 * Overview:
 * An `Equivalence` instance for bigints using strict equality (`===`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigInt } from "effect"
 *
 * console.log(BigInt.Equivalence(1n, 1n)) // true
 * console.log(BigInt.Equivalence(1n, 2n)) // false
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
const exportName = "Equivalence";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "An `Equivalence` instance for bigints using strict equality (`===`).";
const sourceExample =
  'import { BigInt } from "effect"\n\nconsole.log(BigInt.Equivalence(1n, 1n)) // true\nconsole.log(BigInt.Equivalence(1n, 2n)) // false';
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
