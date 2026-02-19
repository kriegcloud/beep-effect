/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: concat
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.762Z
 *
 * Overview:
 * Concatenates another `TxChunk` to the end of this `TxChunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk, Effect, TxChunk } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const txChunk1 = yield* TxChunk.fromIterable([1, 2, 3])
 *   const txChunk2 = yield* TxChunk.fromIterable([4, 5, 6])
 *
 *   // Concatenate atomically within a transaction
 *   yield* TxChunk.concat(txChunk1, txChunk2)
 *
 *   const result = yield* TxChunk.get(txChunk1)
 *   console.log(Chunk.toReadonlyArray(result)) // [1, 2, 3, 4, 5, 6]
 *
 *   // Original txChunk2 is unchanged
 *   const original = yield* TxChunk.get(txChunk2)
 *   console.log(Chunk.toReadonlyArray(original)) // [4, 5, 6]
 * })
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxChunkModule from "effect/TxChunk";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "concat";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Concatenates another `TxChunk` to the end of this `TxChunk`.";
const sourceExample =
  'import { Chunk, Effect, TxChunk } from "effect"\n\nconst program = Effect.gen(function*() {\n  const txChunk1 = yield* TxChunk.fromIterable([1, 2, 3])\n  const txChunk2 = yield* TxChunk.fromIterable([4, 5, 6])\n\n  // Concatenate atomically within a transaction\n  yield* TxChunk.concat(txChunk1, txChunk2)\n\n  const result = yield* TxChunk.get(txChunk1)\n  console.log(Chunk.toReadonlyArray(result)) // [1, 2, 3, 4, 5, 6]\n\n  // Original txChunk2 is unchanged\n  const original = yield* TxChunk.get(txChunk2)\n  console.log(Chunk.toReadonlyArray(original)) // [4, 5, 6]\n})';
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
