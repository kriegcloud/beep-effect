/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: getUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.887Z
 *
 * Overview:
 * Gets an element unsafely, will throw on out of bounds
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("a", "b", "c", "d")
 *
 * console.log(Chunk.getUnsafe(chunk, 1)) // "b"
 * console.log(Chunk.getUnsafe(chunk, 3)) // "d"
 *
 * // Warning: This will throw an error for invalid indices
 * try {
 *   Chunk.getUnsafe(chunk, 10) // throws "Index out of bounds"
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Gets an element unsafely, will throw on out of bounds";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk = Chunk.make("a", "b", "c", "d")\n\nconsole.log(Chunk.getUnsafe(chunk, 1)) // "b"\nconsole.log(Chunk.getUnsafe(chunk, 3)) // "d"\n\n// Warning: This will throw an error for invalid indices\ntry {\n  Chunk.getUnsafe(chunk, 10) // throws "Index out of bounds"\n} catch (error) {\n  console.log((error as Error).message) // "Index out of bounds"\n}';
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
