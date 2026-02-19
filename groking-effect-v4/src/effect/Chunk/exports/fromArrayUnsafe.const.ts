/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: fromArrayUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.887Z
 *
 * Overview:
 * Wraps an array into a chunk without copying, unsafe on mutable arrays
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const array = [1, 2, 3, 4, 5]
 * const chunk = Chunk.fromArrayUnsafe(array)
 * console.log(Chunk.toArray(chunk)) // [1, 2, 3, 4, 5]
 * 
 * // Warning: Since this doesn't copy the array, mutations affect the chunk
 * array[0] = 999
 * console.log(Chunk.toArray(chunk)) // [999, 2, 3, 4, 5]
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
import * as ChunkModule from "effect/Chunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromArrayUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Wraps an array into a chunk without copying, unsafe on mutable arrays";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst array = [1, 2, 3, 4, 5]\nconst chunk = Chunk.fromArrayUnsafe(array)\nconsole.log(Chunk.toArray(chunk)) // [1, 2, 3, 4, 5]\n\n// Warning: Since this doesn't copy the array, mutations affect the chunk\narray[0] = 999\nconsole.log(Chunk.toArray(chunk)) // [999, 2, 3, 4, 5]";
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
