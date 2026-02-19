/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: findFirstIndex
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Return the first index for which a predicate holds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findFirstIndex(chunk, (n) => n > 3)
 * console.log(result) // 3
 * 
 * // No match found
 * const notFound = Chunk.findFirstIndex(chunk, (n) => n > 10)
 * console.log(notFound) // undefined
 * 
 * // Find first even number
 * const firstEven = Chunk.findFirstIndex(chunk, (n) => n % 2 === 0)
 * console.log(firstEven) // 1
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
import * as ChunkModule from "effect/Chunk";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findFirstIndex";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Return the first index for which a predicate holds.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconst result = Chunk.findFirstIndex(chunk, (n) => n > 3)\nconsole.log(result) // 3\n\n// No match found\nconst notFound = Chunk.findFirstIndex(chunk, (n) => n > 10)\nconsole.log(notFound) // undefined\n\n// Find first even number\nconst firstEven = Chunk.findFirstIndex(chunk, (n) => n % 2 === 0)\nconsole.log(firstEven) // 1";
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
