/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Removes a value from the HashSet, returning a new HashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * 
 * const set = HashSet.make("a", "b", "c")
 * const withoutB = HashSet.remove(set, "b")
 * 
 * console.log(HashSet.size(set)) // 3 (original unchanged)
 * console.log(HashSet.size(withoutB)) // 2
 * console.log(HashSet.has(withoutB, "b")) // false
 * 
 * // Removing non-existent value has no effect
 * const same = HashSet.remove(set, "d")
 * console.log(HashSet.size(same)) // 3
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
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Removes a value from the HashSet, returning a new HashSet.";
const sourceExample = "import * as HashSet from \"effect/HashSet\"\n\nconst set = HashSet.make(\"a\", \"b\", \"c\")\nconst withoutB = HashSet.remove(set, \"b\")\n\nconsole.log(HashSet.size(set)) // 3 (original unchanged)\nconsole.log(HashSet.size(withoutB)) // 2\nconsole.log(HashSet.has(withoutB, \"b\")) // false\n\n// Removing non-existent value has no effect\nconst same = HashSet.remove(set, \"d\")\nconsole.log(HashSet.size(same)) // 3";
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
