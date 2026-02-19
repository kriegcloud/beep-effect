/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: append
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.233Z
 *
 * Overview:
 * Append an element to the end of an `Iterable`, creating a new `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 2, 3]
 * const withFour = Iterable.append(numbers, 4)
 * console.log(Array.from(withFour)) // [1, 2, 3, 4]
 *
 * // Chain multiple appends
 * const result = Iterable.append(
 *   Iterable.append([1, 2], 3),
 *   4
 * )
 * console.log(Array.from(result)) // [1, 2, 3, 4]
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "append";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Append an element to the end of an `Iterable`, creating a new `Iterable`.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 2, 3]\nconst withFour = Iterable.append(numbers, 4)\nconsole.log(Array.from(withFour)) // [1, 2, 3, 4]\n\n// Chain multiple appends\nconst result = Iterable.append(\n  Iterable.append([1, 2], 3),\n  4\n)\nconsole.log(Array.from(result)) // [1, 2, 3, 4]';
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
