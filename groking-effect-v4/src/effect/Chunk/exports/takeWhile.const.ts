/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: takeWhile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.889Z
 *
 * Overview:
 * Takes all elements so long as the predicate returns true.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)
 * const result = Chunk.takeWhile(chunk, (n) => n < 4)
 * console.log(Chunk.toArray(result)) // [1, 2, 3]
 * 
 * // Empty if first element doesn't match
 * const none = Chunk.takeWhile(chunk, (n) => n > 5)
 * console.log(Chunk.toArray(none)) // []
 * 
 * // Takes all if all match
 * const small = Chunk.make(1, 2, 3)
 * const all = Chunk.takeWhile(small, (n) => n < 10)
 * console.log(Chunk.toArray(all)) // [1, 2, 3]
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
const exportName = "takeWhile";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Takes all elements so long as the predicate returns true.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)\nconst result = Chunk.takeWhile(chunk, (n) => n < 4)\nconsole.log(Chunk.toArray(result)) // [1, 2, 3]\n\n// Empty if first element doesn't match\nconst none = Chunk.takeWhile(chunk, (n) => n > 5)\nconsole.log(Chunk.toArray(none)) // []\n\n// Takes all if all match\nconst small = Chunk.make(1, 2, 3)\nconst all = Chunk.takeWhile(small, (n) => n < 10)\nconsole.log(Chunk.toArray(all)) // [1, 2, 3]";
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
