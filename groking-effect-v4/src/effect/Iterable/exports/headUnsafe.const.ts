/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: headUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.170Z
 *
 * Overview:
 * Get the first element of a `Iterable`, or throw an error if the `Iterable` is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 2, 3]
 * console.log(Iterable.headUnsafe(numbers)) // 1
 *
 * const letters = "hello"
 * console.log(Iterable.headUnsafe(letters)) // "h"
 *
 * // This will throw an error!
 * try {
 *   const empty = Iterable.empty<number>()
 *   Iterable.headUnsafe(empty) // throws Error: "headUnsafe: empty iterable"
 * } catch (error) {
 *   console.log((error as Error).message) // "headUnsafe: empty iterable"
 * }
 *
 * // Use only when you're certain the iterable is non-empty
 * const nonEmpty = Iterable.range(1, 10)
 * console.log(Iterable.headUnsafe(nonEmpty)) // 1
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
const exportName = "headUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Get the first element of a `Iterable`, or throw an error if the `Iterable` is empty.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 2, 3]\nconsole.log(Iterable.headUnsafe(numbers)) // 1\n\nconst letters = "hello"\nconsole.log(Iterable.headUnsafe(letters)) // "h"\n\n// This will throw an error!\ntry {\n  const empty = Iterable.empty<number>()\n  Iterable.headUnsafe(empty) // throws Error: "headUnsafe: empty iterable"\n} catch (error) {\n  console.log((error as Error).message) // "headUnsafe: empty iterable"\n}\n\n// Use only when you\'re certain the iterable is non-empty\nconst nonEmpty = Iterable.range(1, 10)\nconsole.log(Iterable.headUnsafe(nonEmpty)) // 1';
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
