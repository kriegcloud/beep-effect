/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: isNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.762Z
 *
 * Overview:
 * Checks if the `TxChunk` is non-empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxChunk } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const emptyChunk = yield* TxChunk.empty<number>()
 *   const nonEmptyChunk = yield* TxChunk.fromIterable([1, 2, 3])
 * 
 *   // Check if chunks are non-empty - automatically transactional
 *   const isNonEmpty1 = yield* TxChunk.isNonEmpty(emptyChunk)
 *   const isNonEmpty2 = yield* TxChunk.isNonEmpty(nonEmptyChunk)
 * 
 *   console.log(isNonEmpty1) // false
 *   console.log(isNonEmpty2) // true
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
const exportName = "isNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Checks if the `TxChunk` is non-empty.";
const sourceExample = "import { Effect, TxChunk } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const emptyChunk = yield* TxChunk.empty<number>()\n  const nonEmptyChunk = yield* TxChunk.fromIterable([1, 2, 3])\n\n  // Check if chunks are non-empty - automatically transactional\n  const isNonEmpty1 = yield* TxChunk.isNonEmpty(emptyChunk)\n  const isNonEmpty2 = yield* TxChunk.isNonEmpty(nonEmptyChunk)\n\n  console.log(isNonEmpty1) // false\n  console.log(isNonEmpty2) // true\n})";
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
