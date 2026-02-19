/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.171Z
 *
 * Overview:
 * Return the number of elements in a `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 2, 3, 4, 5]
 * console.log(Iterable.size(numbers)) // 5
 *
 * const empty = Iterable.empty<number>()
 * console.log(Iterable.size(empty)) // 0
 *
 * // Works with any iterable
 * const letters = "hello"
 * console.log(Iterable.size(letters)) // 5
 *
 * // Note: This consumes the entire iterable
 * const range = Iterable.range(1, 100)
 * console.log(Iterable.size(range)) // 100
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Return the number of elements in a `Iterable`.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 2, 3, 4, 5]\nconsole.log(Iterable.size(numbers)) // 5\n\nconst empty = Iterable.empty<number>()\nconsole.log(Iterable.size(empty)) // 0\n\n// Works with any iterable\nconst letters = "hello"\nconsole.log(Iterable.size(letters)) // 5\n\n// Note: This consumes the entire iterable\nconst range = Iterable.range(1, 100)\nconsole.log(Iterable.size(range)) // 100';
const moduleRecord = IterableModule as Record<string, unknown>;

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
