/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:50:34.379Z
 *
 * Overview:
 * Compares the two chunks of equal length using the specified function
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 *
 * const chunk1 = Chunk.make(1, 2, 3)
 * const chunk2 = Chunk.make(1, 2, 3)
 * const chunk3 = Chunk.make(1, 2, 4)
 *
 * const eq = Chunk.makeEquivalence(Equivalence.strictEqual<number>())
 * console.log(eq(chunk1, chunk2)) // true
 * console.log(eq(chunk1, chunk3)) // false
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Compares the two chunks of equal length using the specified function";
const sourceExample =
  'import { Chunk } from "effect"\nimport * as Equivalence from "effect/Equivalence"\n\nconst chunk1 = Chunk.make(1, 2, 3)\nconst chunk2 = Chunk.make(1, 2, 3)\nconst chunk3 = Chunk.make(1, 2, 4)\n\nconst eq = Chunk.makeEquivalence(Equivalence.strictEqual<number>())\nconsole.log(eq(chunk1, chunk2)) // true\nconsole.log(eq(chunk1, chunk3)) // false';
const moduleRecord = ChunkModule as Record<string, unknown>;

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
