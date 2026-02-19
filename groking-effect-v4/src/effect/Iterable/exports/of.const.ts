/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: of
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Creates an iterable containing a single element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const single = Iterable.of(42)
 * console.log(Array.from(single)) // [42]
 *
 * // Useful for creating homogeneous sequences
 * const sequences = [
 *   Iterable.of("hello"),
 *   Iterable.range(1, 3),
 *   Iterable.empty<string>()
 * ]
 *
 * // Can be used with flatMap for conditional inclusion
 * const numbers = [1, 2, 3, 4, 5]
 * const evensOnly = Iterable.flatMap(
 *   numbers,
 *   (n) => n % 2 === 0 ? Iterable.of(n) : Iterable.empty()
 * )
 * console.log(Array.from(evensOnly)) // [2, 4]
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
const exportName = "of";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Creates an iterable containing a single element.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst single = Iterable.of(42)\nconsole.log(Array.from(single)) // [42]\n\n// Useful for creating homogeneous sequences\nconst sequences = [\n  Iterable.of("hello"),\n  Iterable.range(1, 3),\n  Iterable.empty<string>()\n]\n\n// Can be used with flatMap for conditional inclusion\nconst numbers = [1, 2, 3, 4, 5]\nconst evensOnly = Iterable.flatMap(\n  numbers,\n  (n) => n % 2 === 0 ? Iterable.of(n) : Iterable.empty()\n)\nconsole.log(Array.from(evensOnly)) // [2, 4]';
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
