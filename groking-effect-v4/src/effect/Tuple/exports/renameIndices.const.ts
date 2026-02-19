/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: renameIndices
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:14:22.584Z
 *
 * Overview:
 * Rearranges elements of a tuple by providing an array of stringified source indices. Each position in the array specifies which index to read from (e.g., `["2", "1", "0"]` reverses a 3-element tuple).
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Tuple } from "effect"
 * 
 * const result = pipe(
 *   Tuple.make("a", "b", "c"),
 *   Tuple.renameIndices(["2", "1", "0"])
 * )
 * console.log(result) // ["c", "b", "a"]
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
import * as TupleModule from "effect/Tuple";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "renameIndices";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary = "Rearranges elements of a tuple by providing an array of stringified source indices. Each position in the array specifies which index to read from (e.g., `[\"2\", \"1\", \"0\"]` revers...";
const sourceExample = "import { pipe, Tuple } from \"effect\"\n\nconst result = pipe(\n  Tuple.make(\"a\", \"b\", \"c\"),\n  Tuple.renameIndices([\"2\", \"1\", \"0\"])\n)\nconsole.log(result) // [\"c\", \"b\", \"a\"]";
const moduleRecord = TupleModule as Record<string, unknown>;

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
