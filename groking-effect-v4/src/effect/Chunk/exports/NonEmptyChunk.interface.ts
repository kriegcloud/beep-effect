/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: NonEmptyChunk
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * A non-empty Chunk guaranteed to contain at least one element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const nonEmptyChunk: Chunk.NonEmptyChunk<number> = Chunk.make(1, 2, 3)
 * console.log(Chunk.headNonEmpty(nonEmptyChunk)) // 1
 * console.log(Chunk.lastNonEmpty(nonEmptyChunk)) // 3
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
const exportName = "NonEmptyChunk";
const exportKind = "interface";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "A non-empty Chunk guaranteed to contain at least one element.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst nonEmptyChunk: Chunk.NonEmptyChunk<number> = Chunk.make(1, 2, 3)\nconsole.log(Chunk.headNonEmpty(nonEmptyChunk)) // 1\nconsole.log(Chunk.lastNonEmpty(nonEmptyChunk)) // 3";
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
