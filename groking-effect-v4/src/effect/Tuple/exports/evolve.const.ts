/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: evolve
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:14:22.584Z
 *
 * Overview:
 * Transforms elements of a tuple by providing an array of transform functions. Each function applies to the element at the same position. Positions beyond the array's length are copied unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Tuple } from "effect"
 *
 * const result = pipe(
 *   Tuple.make("hello", 42, true),
 *   Tuple.evolve([
 *     (s) => s.toUpperCase(),
 *     (n) => n * 2
 *   ])
 * )
 * console.log(result) // ["HELLO", 84, true]
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "evolve";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary =
  "Transforms elements of a tuple by providing an array of transform functions. Each function applies to the element at the same position. Positions beyond the array's length are c...";
const sourceExample =
  'import { pipe, Tuple } from "effect"\n\nconst result = pipe(\n  Tuple.make("hello", 42, true),\n  Tuple.evolve([\n    (s) => s.toUpperCase(),\n    (n) => n * 2\n  ])\n)\nconsole.log(result) // ["HELLO", 84, true]';
const moduleRecord = TupleModule as Record<string, unknown>;

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
