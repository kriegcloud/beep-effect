/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.763Z
 *
 * Overview:
 * Gets the size of the `TxChunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxChunk } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const txChunk = yield* TxChunk.fromIterable([1, 2, 3, 4, 5])
 * 
 *   // Get the current size - automatically transactional
 *   const currentSize = yield* TxChunk.size(txChunk)
 *   console.log(currentSize) // 5
 * 
 *   // Size is tracked for conflict detection
 *   yield* TxChunk.append(txChunk, 6)
 *   const newSize = yield* TxChunk.size(txChunk)
 *   console.log(newSize) // 6
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
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Gets the size of the `TxChunk`.";
const sourceExample = "import { Effect, TxChunk } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const txChunk = yield* TxChunk.fromIterable([1, 2, 3, 4, 5])\n\n  // Get the current size - automatically transactional\n  const currentSize = yield* TxChunk.size(txChunk)\n  console.log(currentSize) // 5\n\n  // Size is tracked for conflict detection\n  yield* TxChunk.append(txChunk, 6)\n  const newSize = yield* TxChunk.size(txChunk)\n  console.log(newSize) // 6\n})";
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
