/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.762Z
 *
 * Overview:
 * Creates a new `TxChunk` from an iterable.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk, Effect, TxChunk } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create TxChunk from array
 *   const txChunk = yield* TxChunk.fromIterable([1, 2, 3, 4, 5])
 * 
 *   // Read the contents - automatically transactional
 *   const chunk = yield* TxChunk.get(txChunk)
 *   console.log(Chunk.toReadonlyArray(chunk)) // [1, 2, 3, 4, 5]
 * 
 *   // Multi-step atomic modification - use explicit transaction
 *   yield* Effect.atomic(
 *     Effect.gen(function*() {
 *       yield* TxChunk.append(txChunk, 6)
 *       yield* TxChunk.prepend(txChunk, 0)
 *     })
 *   )
 * 
 *   const updated = yield* TxChunk.get(txChunk)
 *   console.log(Chunk.toReadonlyArray(updated)) // [0, 1, 2, 3, 4, 5, 6]
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Creates a new `TxChunk` from an iterable.";
const sourceExample = "import { Chunk, Effect, TxChunk } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create TxChunk from array\n  const txChunk = yield* TxChunk.fromIterable([1, 2, 3, 4, 5])\n\n  // Read the contents - automatically transactional\n  const chunk = yield* TxChunk.get(txChunk)\n  console.log(Chunk.toReadonlyArray(chunk)) // [1, 2, 3, 4, 5]\n\n  // Multi-step atomic modification - use explicit transaction\n  yield* Effect.atomic(\n    Effect.gen(function*() {\n      yield* TxChunk.append(txChunk, 6)\n      yield* TxChunk.prepend(txChunk, 0)\n    })\n  )\n\n  const updated = yield* TxChunk.get(txChunk)\n  console.log(Chunk.toReadonlyArray(updated)) // [0, 1, 2, 3, 4, 5, 6]\n})";
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
