/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: chop
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.701Z
 *
 * Overview:
 * Repeatedly applies a function that consumes a prefix of the array and produces a value plus the remaining elements, collecting the values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.chop(
 *   [1, 2, 3, 4, 5],
 *   (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]
 * )
 * console.log(result) // [2, 4, 6, 8, 10]
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
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "chop";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Repeatedly applies a function that consumes a prefix of the array and produces a value plus the remaining elements, collecting the values.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.chop(\n  [1, 2, 3, 4, 5],\n  (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]\n)\nconsole.log(result) // [2, 4, 6, 8, 10]';
const moduleRecord = ArrayModule as Record<string, unknown>;

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
