/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: findLast
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Find the last element for which a predicate holds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Option from "effect/Option"
 * 
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findLast(chunk, (n) => n < 4)
 * console.log(Option.isSome(result)) // true
 * console.log(Option.getOrElse(result, () => 0)) // 3
 * 
 * // No match found
 * const notFound = Chunk.findLast(chunk, (n) => n > 10)
 * console.log(Option.isNone(notFound)) // true
 * 
 * // Find last even number
 * const lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)
 * console.log(Option.getOrElse(lastEven, () => 0)) // 4
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
const exportName = "findLast";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Find the last element for which a predicate holds.";
const sourceExample = "import { Chunk } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconst result = Chunk.findLast(chunk, (n) => n < 4)\nconsole.log(Option.isSome(result)) // true\nconsole.log(Option.getOrElse(result, () => 0)) // 3\n\n// No match found\nconst notFound = Chunk.findLast(chunk, (n) => n > 10)\nconsole.log(Option.isNone(notFound)) // true\n\n// Find last even number\nconst lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)\nconsole.log(Option.getOrElse(lastEven, () => 0)) // 4";
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
