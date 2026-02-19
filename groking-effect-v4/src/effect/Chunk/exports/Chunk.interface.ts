/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: Chunk
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.376Z
 *
 * Overview:
 * A Chunk is an immutable, ordered collection optimized for efficient concatenation and access patterns.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk: Chunk.Chunk<number> = Chunk.make(1, 2, 3)
 * console.log(chunk.length) // 3
 * console.log(Chunk.toArray(chunk)) // [1, 2, 3]
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Chunk";
const exportKind = "interface";
const moduleImportPath = "effect/Chunk";
const sourceSummary =
  "A Chunk is an immutable, ordered collection optimized for efficient concatenation and access patterns.";
const sourceExample =
  'import { Chunk } from "effect"\n\nconst chunk: Chunk.Chunk<number> = Chunk.make(1, 2, 3)\nconsole.log(chunk.length) // 3\nconsole.log(Chunk.toArray(chunk)) // [1, 2, 3]';
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
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
