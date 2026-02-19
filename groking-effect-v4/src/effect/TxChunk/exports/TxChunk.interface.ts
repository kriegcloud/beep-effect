/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: TxChunk
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.763Z
 *
 * Overview:
 * TxChunk is a transactional chunk data structure that provides Software Transactional Memory (STM) semantics for chunk operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk, Effect, TxChunk } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a transactional chunk
 *   const txChunk: TxChunk.TxChunk<number> = yield* TxChunk.fromIterable([
 *     1,
 *     2,
 *     3
 *   ])
 * 
 *   // Single operations - no explicit transaction needed
 *   yield* TxChunk.append(txChunk, 4)
 *   const result = yield* TxChunk.get(txChunk)
 *   console.log(Chunk.toReadonlyArray(result)) // [1, 2, 3, 4]
 * 
 *   // Multi-step atomic operation - use explicit transaction
 *   yield* Effect.atomic(
 *     Effect.gen(function*() {
 *       yield* TxChunk.prepend(txChunk, 0)
 *       yield* TxChunk.append(txChunk, 5)
 *     })
 *   )
 * 
 *   const finalResult = yield* TxChunk.get(txChunk)
 *   console.log(Chunk.toReadonlyArray(finalResult)) // [0, 1, 2, 3, 4, 5]
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxChunkModule from "effect/TxChunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TxChunk";
const exportKind = "interface";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "TxChunk is a transactional chunk data structure that provides Software Transactional Memory (STM) semantics for chunk operations.";
const sourceExample = "import { Chunk, Effect, TxChunk } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a transactional chunk\n  const txChunk: TxChunk.TxChunk<number> = yield* TxChunk.fromIterable([\n    1,\n    2,\n    3\n  ])\n\n  // Single operations - no explicit transaction needed\n  yield* TxChunk.append(txChunk, 4)\n  const result = yield* TxChunk.get(txChunk)\n  console.log(Chunk.toReadonlyArray(result)) // [1, 2, 3, 4]\n\n  // Multi-step atomic operation - use explicit transaction\n  yield* Effect.atomic(\n    Effect.gen(function*() {\n      yield* TxChunk.prepend(txChunk, 0)\n      yield* TxChunk.append(txChunk, 5)\n    })\n  )\n\n  const finalResult = yield* TxChunk.get(txChunk)\n  console.log(Chunk.toReadonlyArray(finalResult)) // [0, 1, 2, 3, 4, 5]\n})";
const moduleRecord = TxChunkModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
