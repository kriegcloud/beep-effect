/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: appendElements
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:50:43.574Z
 *
 * Overview:
 * Concatenates two tuples into a single tuple.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Tuple } from "effect"
 *
 * const result = pipe(Tuple.make(1, 2), Tuple.appendElements(["a", "b"] as const))
 * console.log(result) // [1, 2, "a", "b"]
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "appendElements";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary = "Concatenates two tuples into a single tuple.";
const sourceExample =
  'import { pipe, Tuple } from "effect"\n\nconst result = pipe(Tuple.make(1, 2), Tuple.appendElements(["a", "b"] as const))\nconsole.log(result) // [1, 2, "a", "b"]';
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
