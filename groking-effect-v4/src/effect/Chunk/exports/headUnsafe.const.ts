/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: headUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.378Z
 *
 * Overview:
 * Returns the first element of this chunk.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.headUnsafe(chunk)) // 1
 *
 * const singleElement = Chunk.make("hello")
 * console.log(Chunk.headUnsafe(singleElement)) // "hello"
 *
 * // Warning: This will throw for empty chunks
 * try {
 *   Chunk.headUnsafe(Chunk.empty())
 * } catch (error) {
 *   console.log((error as Error).message) // "Index out of bounds"
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "headUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns the first element of this chunk.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make(1, 2, 3, 4)\nconsole.log(Chunk.headUnsafe(chunk)) // 1\n\nconst singleElement = Chunk.make("hello")\nconsole.log(Chunk.headUnsafe(singleElement)) // "hello"\n\n// Warning: This will throw for empty chunks\ntry {\n  Chunk.headUnsafe(Chunk.empty())\n} catch (error) {\n  console.log((error as Error).message) // "Index out of bounds"\n}';
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
