/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: prependAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Prepends the specified prefix chunk to the beginning of the specified chunk. If either chunk is non-empty, the result is also a non-empty chunk.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const result = Chunk.make(1, 2).pipe(
 *   Chunk.prependAll(Chunk.make("a", "b")),
 *   Chunk.toArray
 * )
 * 
 * console.log(result)
 * // [ "a", "b", 1, 2 ]
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
const exportName = "prependAll";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Prepends the specified prefix chunk to the beginning of the specified chunk. If either chunk is non-empty, the result is also a non-empty chunk.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst result = Chunk.make(1, 2).pipe(\n  Chunk.prependAll(Chunk.make(\"a\", \"b\")),\n  Chunk.toArray\n)\n\nconsole.log(result)\n// [ \"a\", \"b\", 1, 2 ]";
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
