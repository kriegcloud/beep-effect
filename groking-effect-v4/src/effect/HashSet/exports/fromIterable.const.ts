/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Creates a HashSet from an iterable collection of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * 
 * const fromArray = HashSet.fromIterable(["a", "b", "c", "b", "a"])
 * console.log(HashSet.size(fromArray)) // 3
 * 
 * const fromSet = HashSet.fromIterable(new Set([1, 2, 3]))
 * console.log(HashSet.size(fromSet)) // 3
 * 
 * const fromString = HashSet.fromIterable("hello")
 * console.log(Array.from(fromString)) // ["h", "e", "l", "o"]
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
import * as HashSetModule from "effect/HashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Creates a HashSet from an iterable collection of values.";
const sourceExample = "import * as HashSet from \"effect/HashSet\"\n\nconst fromArray = HashSet.fromIterable([\"a\", \"b\", \"c\", \"b\", \"a\"])\nconsole.log(HashSet.size(fromArray)) // 3\n\nconst fromSet = HashSet.fromIterable(new Set([1, 2, 3]))\nconsole.log(HashSet.size(fromSet)) // 3\n\nconst fromString = HashSet.fromIterable(\"hello\")\nconsole.log(Array.from(fromString)) // [\"h\", \"e\", \"l\", \"o\"]";
const moduleRecord = HashSetModule as Record<string, unknown>;

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
