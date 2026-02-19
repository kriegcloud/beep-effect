/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: every
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Check if a predicate holds true for every `Chunk` element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const allPositive = Chunk.make(1, 2, 3, 4, 5)
 * console.log(Chunk.every(allPositive, (n) => n > 0)) // true
 * console.log(Chunk.every(allPositive, (n) => n > 3)) // false
 *
 * // Empty chunk returns true
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.every(empty, (n) => n > 0)) // true
 *
 * // Type refinement
 * const mixed = Chunk.make(1, 2, 3)
 * if (Chunk.every(mixed, (x): x is number => typeof x === "number")) {
 *   // mixed is now typed as Chunk<number>
 *   console.log("All elements are numbers")
 * }
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
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "every";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Check if a predicate holds true for every `Chunk` element.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst allPositive = Chunk.make(1, 2, 3, 4, 5)\nconsole.log(Chunk.every(allPositive, (n) => n > 0)) // true\nconsole.log(Chunk.every(allPositive, (n) => n > 3)) // false\n\n// Empty chunk returns true\nconst empty = Chunk.empty<number>()\nconsole.log(Chunk.every(empty, (n) => n > 0)) // true\n\n// Type refinement\nconst mixed = Chunk.make(1, 2, 3)\nif (Chunk.every(mixed, (x): x is number => typeof x === "number")) {\n  // mixed is now typed as Chunk<number>\n  console.log("All elements are numbers")\n}';
const moduleRecord = ChunkModule as Record<string, unknown>;

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
