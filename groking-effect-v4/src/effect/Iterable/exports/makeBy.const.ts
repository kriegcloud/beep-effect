/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: makeBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Creates an iterable by applying a function to consecutive integers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * // Generate first 5 even numbers
 * const evens = Iterable.makeBy((n) => n * 2, { length: 5 })
 * console.log(Array.from(evens)) // [0, 2, 4, 6, 8]
 * 
 * // Generate squares
 * const squares = Iterable.makeBy((n) => n * n, { length: 4 })
 * console.log(Array.from(squares)) // [0, 1, 4, 9]
 * 
 * // Infinite sequence (be careful when consuming!)
 * const naturals = Iterable.makeBy((n) => n)
 * const first10 = Iterable.take(naturals, 10)
 * console.log(Array.from(first10)) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as IterableModule from "effect/Iterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeBy";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Creates an iterable by applying a function to consecutive integers.";
const sourceExample = "import { Iterable } from \"effect\"\n\n// Generate first 5 even numbers\nconst evens = Iterable.makeBy((n) => n * 2, { length: 5 })\nconsole.log(Array.from(evens)) // [0, 2, 4, 6, 8]\n\n// Generate squares\nconst squares = Iterable.makeBy((n) => n * n, { length: 4 })\nconsole.log(Array.from(squares)) // [0, 1, 4, 9]\n\n// Infinite sequence (be careful when consuming!)\nconst naturals = Iterable.makeBy((n) => n)\nconst first10 = Iterable.take(naturals, 10)\nconsole.log(Array.from(first10)) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
