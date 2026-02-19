/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Returns a filtered subset of the elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)
 * console.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]
 *
 * // With refinement
 * const mixed = Chunk.make("hello", 42, "world", 100)
 * const numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")
 * console.log(Chunk.toArray(numbers)) // [42, 100]
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
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns a filtered subset of the elements.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5, 6)\nconst evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)\nconsole.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]\n\n// With refinement\nconst mixed = Chunk.make("hello", 42, "world", 100)\nconst numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")\nconsole.log(Chunk.toArray(numbers)) // [42, 100]';
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
