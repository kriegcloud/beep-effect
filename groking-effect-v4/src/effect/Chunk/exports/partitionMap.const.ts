/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: partitionMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Partitions the elements of this chunk into two chunks using f.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Result from "effect/Result"
 *
 * const chunk = Chunk.make("1", "hello", "2", "world", "3")
 * const [errors, numbers] = Chunk.partitionMap(chunk, (str) => {
 *   const num = parseInt(str)
 *   return isNaN(num)
 *     ? Result.fail(`"${str}" is not a number`)
 *     : Result.succeed(num)
 * })
 *
 * console.log(Chunk.toArray(errors)) // ['"hello" is not a number', '"world" is not a number']
 * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
 *
 * // All successes
 * const validNumbers = Chunk.make("1", "2", "3")
 * const [noErrors, allNumbers] = Chunk.partitionMap(
 *   validNumbers,
 *   (str) => Result.succeed(parseInt(str))
 * )
 * console.log(Chunk.toArray(noErrors)) // []
 * console.log(Chunk.toArray(allNumbers)) // [1, 2, 3]
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
const exportName = "partitionMap";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Partitions the elements of this chunk into two chunks using f.";
const sourceExample =
  'import { Chunk } from "effect"\nimport * as Result from "effect/Result"\n\nconst chunk = Chunk.make("1", "hello", "2", "world", "3")\nconst [errors, numbers] = Chunk.partitionMap(chunk, (str) => {\n  const num = parseInt(str)\n  return isNaN(num)\n    ? Result.fail(`"${str}" is not a number`)\n    : Result.succeed(num)\n})\n\nconsole.log(Chunk.toArray(errors)) // [\'"hello" is not a number\', \'"world" is not a number\']\nconsole.log(Chunk.toArray(numbers)) // [1, 2, 3]\n\n// All successes\nconst validNumbers = Chunk.make("1", "2", "3")\nconst [noErrors, allNumbers] = Chunk.partitionMap(\n  validNumbers,\n  (str) => Result.succeed(parseInt(str))\n)\nconsole.log(Chunk.toArray(noErrors)) // []\nconsole.log(Chunk.toArray(allNumbers)) // [1, 2, 3]';
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
