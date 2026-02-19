/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashSet
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashSet.ts
 * Generated: 2026-02-19T04:14:15.152Z
 *
 * Overview:
 * Removes the specified value from the MutableHashSet, mutating the set in place. If the value doesn't exist, the set remains unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableHashSet } from "effect"
 * 
 * const set = MutableHashSet.make("apple", "banana", "cherry")
 * 
 * console.log(MutableHashSet.size(set)) // 3
 * 
 * // Remove existing value
 * MutableHashSet.remove(set, "banana")
 * console.log(MutableHashSet.size(set)) // 2
 * console.log(MutableHashSet.has(set, "banana")) // false
 * 
 * // Remove non-existent value (no effect)
 * MutableHashSet.remove(set, "grape")
 * console.log(MutableHashSet.size(set)) // 2
 * 
 * // Pipe-able version
 * const removeFruit = MutableHashSet.remove("apple")
 * removeFruit(set)
 * console.log(MutableHashSet.size(set)) // 1
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
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashSet";
const sourceSummary = "Removes the specified value from the MutableHashSet, mutating the set in place. If the value doesn't exist, the set remains unchanged.";
const sourceExample = "import { MutableHashSet } from \"effect\"\n\nconst set = MutableHashSet.make(\"apple\", \"banana\", \"cherry\")\n\nconsole.log(MutableHashSet.size(set)) // 3\n\n// Remove existing value\nMutableHashSet.remove(set, \"banana\")\nconsole.log(MutableHashSet.size(set)) // 2\nconsole.log(MutableHashSet.has(set, \"banana\")) // false\n\n// Remove non-existent value (no effect)\nMutableHashSet.remove(set, \"grape\")\nconsole.log(MutableHashSet.size(set)) // 2\n\n// Pipe-able version\nconst removeFruit = MutableHashSet.remove(\"apple\")\nremoveFruit(set)\nconsole.log(MutableHashSet.size(set)) // 1";
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
