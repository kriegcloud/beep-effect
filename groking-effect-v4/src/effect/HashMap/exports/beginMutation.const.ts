/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: beginMutation
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.823Z
 *
 * Overview:
 * Marks the `HashMap` as mutable for performance optimization during batch operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * const map = HashMap.make(["a", 1])
 * 
 * // Begin mutation for efficient batch operations
 * const mutable = HashMap.beginMutation(map)
 * 
 * // Multiple operations are now more efficient
 * HashMap.set(mutable, "b", 2)
 * HashMap.set(mutable, "c", 3)
 * HashMap.remove(mutable, "a")
 * 
 * // End mutation to get final immutable result
 * const result = HashMap.endMutation(mutable)
 * console.log(HashMap.size(result)) // 2
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
import * as HashMapModule from "effect/HashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "beginMutation";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Marks the `HashMap` as mutable for performance optimization during batch operations.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\nconst map = HashMap.make([\"a\", 1])\n\n// Begin mutation for efficient batch operations\nconst mutable = HashMap.beginMutation(map)\n\n// Multiple operations are now more efficient\nHashMap.set(mutable, \"b\", 2)\nHashMap.set(mutable, \"c\", 3)\nHashMap.remove(mutable, \"a\")\n\n// End mutation to get final immutable result\nconst result = HashMap.endMutation(mutable)\nconsole.log(HashMap.size(result)) // 2";
const moduleRecord = HashMapModule as Record<string, unknown>;

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
