/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashSet
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashSet.ts
 * Generated: 2026-02-19T04:14:15.152Z
 *
 * Overview:
 * Creates a MutableHashSet from a variable number of values. Duplicates are automatically removed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableHashSet } from "effect"
 * 
 * const set = MutableHashSet.make("apple", "banana", "apple", "cherry")
 * 
 * console.log(MutableHashSet.size(set)) // 3
 * console.log(Array.from(set)) // ["apple", "banana", "cherry"]
 * 
 * // With numbers
 * const numbers = MutableHashSet.make(1, 2, 3, 2, 1)
 * console.log(MutableHashSet.size(numbers)) // 3
 * console.log(Array.from(numbers)) // [1, 2, 3]
 * 
 * // Mixed types
 * const mixed = MutableHashSet.make("hello", 42, true, "hello")
 * console.log(MutableHashSet.size(mixed)) // 3
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
import * as MutableHashSetModule from "effect/MutableHashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashSet";
const sourceSummary = "Creates a MutableHashSet from a variable number of values. Duplicates are automatically removed.";
const sourceExample = "import { MutableHashSet } from \"effect\"\n\nconst set = MutableHashSet.make(\"apple\", \"banana\", \"apple\", \"cherry\")\n\nconsole.log(MutableHashSet.size(set)) // 3\nconsole.log(Array.from(set)) // [\"apple\", \"banana\", \"cherry\"]\n\n// With numbers\nconst numbers = MutableHashSet.make(1, 2, 3, 2, 1)\nconsole.log(MutableHashSet.size(numbers)) // 3\nconsole.log(Array.from(numbers)) // [1, 2, 3]\n\n// Mixed types\nconst mixed = MutableHashSet.make(\"hello\", 42, true, \"hello\")\nconsole.log(MutableHashSet.size(mixed)) // 3";
const moduleRecord = MutableHashSetModule as Record<string, unknown>;

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
