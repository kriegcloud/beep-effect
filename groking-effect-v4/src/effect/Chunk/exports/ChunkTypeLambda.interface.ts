/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: ChunkTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.885Z
 *
 * Overview:
 * Type lambda for Chunk, used for higher-kinded type operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { ChunkTypeLambda } from "effect/Chunk"
 * import type { Kind } from "effect/HKT"
 * 
 * // Create a Chunk type using the type lambda
 * type NumberChunk = Kind<ChunkTypeLambda, never, never, never, number>
 * // Equivalent to: Chunk<number>
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
import * as ChunkModule from "effect/Chunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ChunkTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Type lambda for Chunk, used for higher-kinded type operations.";
const sourceExample = "import type { ChunkTypeLambda } from \"effect/Chunk\"\nimport type { Kind } from \"effect/HKT\"\n\n// Create a Chunk type using the type lambda\ntype NumberChunk = Kind<ChunkTypeLambda, never, never, never, number>\n// Equivalent to: Chunk<number>";
const moduleRecord = ChunkModule as Record<string, unknown>;

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
