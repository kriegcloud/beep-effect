/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: unfold
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Generates an iterable by repeatedly applying a function that produces the next element and state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Generate Fibonacci sequence
 * const fibonacci = Iterable.unfold([0, 1], ([a, b]) => [a, [b, a + b]])
 * const first10Fib = Iterable.take(fibonacci, 10)
 * console.log(Array.from(first10Fib)) // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
 *
 * // Generate powers of 2 up to a limit
 * const powersOf2 = Iterable.unfold(1, (n) => n <= 1000 ? [n, n * 2] : undefined)
 * console.log(Array.from(powersOf2)) // [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
 *
 * // Generate countdown
 * const countdown = Iterable.unfold(5, (n) => n > 0 ? [n, n - 1] : undefined)
 * console.log(Array.from(countdown)) // [5, 4, 3, 2, 1]
 *
 * // Generate collatz sequence
 * const collatz = Iterable.unfold(7, (n) => {
 *   if (n === 1) return undefined
 *   const next = n % 2 === 0 ? n / 2 : n * 3 + 1
 *   return [n, next]
 * })
 * console.log(Array.from(collatz)) // [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2]
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
const exportName = "unfold";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Generates an iterable by repeatedly applying a function that produces the next element and state.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Generate Fibonacci sequence\nconst fibonacci = Iterable.unfold([0, 1], ([a, b]) => [a, [b, a + b]])\nconst first10Fib = Iterable.take(fibonacci, 10)\nconsole.log(Array.from(first10Fib)) // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\n// Generate powers of 2 up to a limit\nconst powersOf2 = Iterable.unfold(1, (n) => n <= 1000 ? [n, n * 2] : undefined)\nconsole.log(Array.from(powersOf2)) // [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]\n\n// Generate countdown\nconst countdown = Iterable.unfold(5, (n) => n > 0 ? [n, n - 1] : undefined)\nconsole.log(Array.from(countdown)) // [5, 4, 3, 2, 1]\n\n// Generate collatz sequence\nconst collatz = Iterable.unfold(7, (n) => {\n  if (n === 1) return undefined\n  const next = n % 2 === 0 ? n / 2 : n * 3 + 1\n  return [n, next]\n})\nconsole.log(Array.from(collatz)) // [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2]';
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
