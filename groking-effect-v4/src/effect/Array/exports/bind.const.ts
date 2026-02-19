/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: bind
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 2]),
 *   Array.bind("y", () => ["a", "b"])
 * )
 * console.log(result)
 * // [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]
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
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "bind";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.";
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind("x", () => [1, 2]),\n  Array.bind("y", () => ["a", "b"])\n)\nconsole.log(result)\n// [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]';
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
