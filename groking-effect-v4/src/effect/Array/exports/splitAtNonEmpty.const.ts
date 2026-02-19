/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: splitAtNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.707Z
 *
 * Overview:
 * Splits a non-empty array into two parts at the given index. The first part is guaranteed to be non-empty (`n` is clamped to >= 1).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))
 * // [["a", "b", "c"], ["d", "e"]]
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
const exportName = "splitAtNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Splits a non-empty array into two parts at the given index. The first part is guaranteed to be non-empty (`n` is clamped to >= 1).";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))\n// [["a", "b", "c"], ["d", "e"]]';
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
