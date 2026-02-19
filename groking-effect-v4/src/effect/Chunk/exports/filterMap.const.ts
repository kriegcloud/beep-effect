/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Returns a filtered and mapped subset of the elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Option from "effect/Option"
 *
 * const chunk = Chunk.make("1", "2", "hello", "3", "world")
 * const numbers = Chunk.filterMap(chunk, (str) => {
 *   const num = parseInt(str)
 *   return isNaN(num) ? Option.none() : Option.some(num)
 * })
 * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
 *
 * // With index parameter
 * const evenIndexNumbers = Chunk.filterMap(chunk, (str, i) => {
 *   const num = parseInt(str)
 *   return isNaN(num) || i % 2 !== 0 ? Option.none() : Option.some(num)
 * })
 * console.log(Chunk.toArray(evenIndexNumbers)) // [1]
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
import * as ChunkModule from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns a filtered and mapped subset of the elements.";
const sourceExample =
  'import { Chunk } from "effect"\nimport * as Option from "effect/Option"\n\nconst chunk = Chunk.make("1", "2", "hello", "3", "world")\nconst numbers = Chunk.filterMap(chunk, (str) => {\n  const num = parseInt(str)\n  return isNaN(num) ? Option.none() : Option.some(num)\n})\nconsole.log(Chunk.toArray(numbers)) // [1, 2, 3]\n\n// With index parameter\nconst evenIndexNumbers = Chunk.filterMap(chunk, (str, i) => {\n  const num = parseInt(str)\n  return isNaN(num) || i % 2 !== 0 ? Option.none() : Option.some(num)\n})\nconsole.log(Chunk.toArray(evenIndexNumbers)) // [1]';
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
