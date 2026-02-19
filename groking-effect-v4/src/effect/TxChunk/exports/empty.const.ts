/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxChunk
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxChunk.ts
 * Generated: 2026-02-19T04:14:22.762Z
 *
 * Overview:
 * Creates a new empty `TxChunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxChunk } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create an empty TxChunk
 *   const txChunk = yield* TxChunk.empty<number>()
 *
 *   // Check if it's empty - automatically transactional
 *   const isEmpty = yield* TxChunk.isEmpty(txChunk)
 *   console.log(isEmpty) // true
 *
 *   // Add elements - automatically transactional
 *   yield* TxChunk.append(txChunk, 42)
 *
 *   const isStillEmpty = yield* TxChunk.isEmpty(txChunk)
 *   console.log(isStillEmpty) // false
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
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/TxChunk";
const sourceSummary = "Creates a new empty `TxChunk`.";
const sourceExample =
  'import { Effect, TxChunk } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create an empty TxChunk\n  const txChunk = yield* TxChunk.empty<number>()\n\n  // Check if it\'s empty - automatically transactional\n  const isEmpty = yield* TxChunk.isEmpty(txChunk)\n  console.log(isEmpty) // true\n\n  // Add elements - automatically transactional\n  yield* TxChunk.append(txChunk, 42)\n\n  const isStillEmpty = yield* TxChunk.isEmpty(txChunk)\n  console.log(isStillEmpty) // false\n})';
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
