/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.887Z
 *
 * Overview:
 * This function provides a safe way to read a value at a particular index from a `Chunk`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * 
 * const chunk = Chunk.make("a", "b", "c", "d")
 * 
 * console.log(Chunk.get(chunk, 1)) // Option.some("b")
 * console.log(Chunk.get(chunk, 10)) // Option.none()
 * console.log(Chunk.get(chunk, -1)) // Option.none()
 * 
 * // Using pipe syntax
 * const result = chunk.pipe(Chunk.get(2))
 * console.log(result) // Option.some("c")
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
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "This function provides a safe way to read a value at a particular index from a `Chunk`.";
const sourceExample = "import { Chunk } from \"effect\"\n\nconst chunk = Chunk.make(\"a\", \"b\", \"c\", \"d\")\n\nconsole.log(Chunk.get(chunk, 1)) // Option.some(\"b\")\nconsole.log(Chunk.get(chunk, 10)) // Option.none()\nconsole.log(Chunk.get(chunk, -1)) // Option.none()\n\n// Using pipe syntax\nconst result = chunk.pipe(Chunk.get(2))\nconsole.log(result) // Option.some(\"c\")";
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
