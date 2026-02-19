/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.763Z
 *
 * Overview:
 * Maps each element of the `TxChunk` using the provided function. Note: This only works when the mapped type B is assignable to A.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk, Effect, TxChunk } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const txChunk = yield* TxChunk.fromIterable([1, 2, 3, 4])
 * 
 *   // Transform each element (must maintain same type)
 *   // Transform each element (must maintain same type) - automatically transactional
 *   yield* TxChunk.map(txChunk, (n) => n * 2)
 * 
 *   const result = yield* TxChunk.get(txChunk)
 *   console.log(Chunk.toReadonlyArray(result)) // [2, 4, 6, 8]
 * })
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
import * as TxChunkModule from "effect/TxChunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Maps each element of the `TxChunk` using the provided function. Note: This only works when the mapped type B is assignable to A.";
const sourceExample = "import { Chunk, Effect, TxChunk } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const txChunk = yield* TxChunk.fromIterable([1, 2, 3, 4])\n\n  // Transform each element (must maintain same type)\n  // Transform each element (must maintain same type) - automatically transactional\n  yield* TxChunk.map(txChunk, (n) => n * 2)\n\n  const result = yield* TxChunk.get(txChunk)\n  console.log(Chunk.toReadonlyArray(result)) // [2, 4, 6, 8]\n})";
const moduleRecord = TxChunkModule as Record<string, unknown>;

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
