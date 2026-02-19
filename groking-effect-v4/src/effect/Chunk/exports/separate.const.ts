/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: separate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.888Z
 *
 * Overview:
 * Partitions the elements of this chunk into two chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk } from "effect"
 * import * as Result from "effect/Result"
 * 
 * const chunk = Chunk.make(
 *   Result.succeed(1),
 *   Result.fail("error1"),
 *   Result.succeed(2),
 *   Result.fail("error2"),
 *   Result.succeed(3)
 * )
 * 
 * const [errors, values] = Chunk.separate(chunk)
 * console.log(Chunk.toArray(errors)) // ["error1", "error2"]
 * console.log(Chunk.toArray(values)) // [1, 2, 3]
 * 
 * // All successes
 * const allSuccesses = Chunk.make(Result.succeed(1), Result.succeed(2))
 * const [noErrors, allValues] = Chunk.separate(allSuccesses)
 * console.log(Chunk.toArray(noErrors)) // []
 * console.log(Chunk.toArray(allValues)) // [1, 2]
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
const exportName = "separate";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Partitions the elements of this chunk into two chunks.";
const sourceExample = "import { Chunk } from \"effect\"\nimport * as Result from \"effect/Result\"\n\nconst chunk = Chunk.make(\n  Result.succeed(1),\n  Result.fail(\"error1\"),\n  Result.succeed(2),\n  Result.fail(\"error2\"),\n  Result.succeed(3)\n)\n\nconst [errors, values] = Chunk.separate(chunk)\nconsole.log(Chunk.toArray(errors)) // [\"error1\", \"error2\"]\nconsole.log(Chunk.toArray(values)) // [1, 2, 3]\n\n// All successes\nconst allSuccesses = Chunk.make(Result.succeed(1), Result.succeed(2))\nconst [noErrors, allValues] = Chunk.separate(allSuccesses)\nconsole.log(Chunk.toArray(noErrors)) // []\nconsole.log(Chunk.toArray(allValues)) // [1, 2]";
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
