/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: join
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.378Z
 *
 * Overview:
 * Joins the elements together with "sep" in the middle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("apple", "banana", "cherry")
 * const result = Chunk.join(chunk, ", ")
 * console.log(result) // "apple, banana, cherry"
 *
 * // With different separator
 * const withPipe = Chunk.join(chunk, " | ")
 * console.log(withPipe) // "apple | banana | cherry"
 *
 * // Empty chunk
 * const empty = Chunk.empty<string>()
 * console.log(Chunk.join(empty, ", ")) // ""
 *
 * // Single element
 * const single = Chunk.make("hello")
 * console.log(Chunk.join(single, ", ")) // "hello"
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
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "join";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = 'Joins the elements together with "sep" in the middle.';
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make("apple", "banana", "cherry")\nconst result = Chunk.join(chunk, ", ")\nconsole.log(result) // "apple, banana, cherry"\n\n// With different separator\nconst withPipe = Chunk.join(chunk, " | ")\nconsole.log(withPipe) // "apple | banana | cherry"\n\n// Empty chunk\nconst empty = Chunk.empty<string>()\nconsole.log(Chunk.join(empty, ", ")) // ""\n\n// Single element\nconst single = Chunk.make("hello")\nconsole.log(Chunk.join(single, ", ")) // "hello"';
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
