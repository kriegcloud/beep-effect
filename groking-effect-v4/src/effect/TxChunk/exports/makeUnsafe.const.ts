/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: makeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.763Z
 *
 * Overview:
 * Creates a new `TxChunk` with the specified TxRef.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk, TxChunk, TxRef } from "effect"
 * 
 * // Create a TxChunk from an existing TxRef (advanced usage)
 * const ref = TxRef.makeUnsafe(Chunk.fromIterable([1, 2, 3]))
 * const txChunk = TxChunk.makeUnsafe(ref)
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
const exportName = "makeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Creates a new `TxChunk` with the specified TxRef.";
const sourceExample = "import { Chunk, TxChunk, TxRef } from \"effect\"\n\n// Create a TxChunk from an existing TxRef (advanced usage)\nconst ref = TxRef.makeUnsafe(Chunk.fromIterable([1, 2, 3]))\nconst txChunk = TxChunk.makeUnsafe(ref)";
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
