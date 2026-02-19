/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Chunk
 * Export: findFirst
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Chunk.ts
 * Generated: 2026-02-19T04:14:10.886Z
 *
 * Overview:
 * Returns the first element that satisfies the specified predicate, or `None` if no such element exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Chunk, Option } from "effect"
 * 
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findFirst(chunk, (n) => n > 3)
 * console.log(Option.isSome(result)) // true
 * console.log(Option.getOrElse(result, () => 0)) // 4
 * 
 * // No match found
 * const notFound = Chunk.findFirst(chunk, (n) => n > 10)
 * console.log(Option.isNone(notFound)) // true
 * 
 * // With type refinement
 * const mixed = Chunk.make(1, "hello", 2, "world", 3)
 * const firstString = Chunk.findFirst(
 *   mixed,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(Option.getOrElse(firstString, () => "")) // "hello"
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
const exportName = "findFirst";
const exportKind = "const";
const moduleImportPath = "effect/Chunk";
const sourceSummary = "Returns the first element that satisfies the specified predicate, or `None` if no such element exists.";
const sourceExample = "import { Chunk, Option } from \"effect\"\n\nconst chunk = Chunk.make(1, 2, 3, 4, 5)\nconst result = Chunk.findFirst(chunk, (n) => n > 3)\nconsole.log(Option.isSome(result)) // true\nconsole.log(Option.getOrElse(result, () => 0)) // 4\n\n// No match found\nconst notFound = Chunk.findFirst(chunk, (n) => n > 10)\nconsole.log(Option.isNone(notFound)) // true\n\n// With type refinement\nconst mixed = Chunk.make(1, \"hello\", 2, \"world\", 3)\nconst firstString = Chunk.findFirst(\n  mixed,\n  (x): x is string => typeof x === \"string\"\n)\nconsole.log(Option.getOrElse(firstString, () => \"\")) // \"hello\"";
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
