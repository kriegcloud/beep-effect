/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Maps each value in the HashSet using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * 
 * const numbers = HashSet.make(1, 2, 3)
 * const doubled = HashSet.map(numbers, (n) => n * 2)
 * 
 * console.log(Array.from(doubled).sort()) // [2, 4, 6]
 * console.log(HashSet.size(doubled)) // 3
 * 
 * // Mapping can reduce size if function produces duplicates
 * const strings = HashSet.make("apple", "banana", "cherry")
 * const lengths = HashSet.map(strings, (s) => s.length)
 * console.log(Array.from(lengths).sort()) // [5, 6] (apple=5, banana=6, cherry=6)
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Maps each value in the HashSet using the provided function.";
const sourceExample = "import * as HashSet from \"effect/HashSet\"\n\nconst numbers = HashSet.make(1, 2, 3)\nconst doubled = HashSet.map(numbers, (n) => n * 2)\n\nconsole.log(Array.from(doubled).sort()) // [2, 4, 6]\nconsole.log(HashSet.size(doubled)) // 3\n\n// Mapping can reduce size if function produces duplicates\nconst strings = HashSet.make(\"apple\", \"banana\", \"cherry\")\nconst lengths = HashSet.map(strings, (s) => s.length)\nconsole.log(Array.from(lengths).sort()) // [5, 6] (apple=5, banana=6, cherry=6)";
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
