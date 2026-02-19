/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: entries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Returns an `IterableIterator` of the entries within the `HashMap`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * // Create a configuration map
 * const config = HashMap.make(
 *   ["database.host", "localhost"],
 *   ["database.port", "5432"],
 *   ["cache.enabled", "true"]
 * )
 * 
 * // Get entries iterator for processing
 * const entries = HashMap.entries(config)
 * 
 * // Process each configuration entry
 * for (const [key, value] of entries) {
 *   console.log(`Setting ${key} = ${value}`)
 * }
 * // Setting database.host = localhost
 * // Setting database.port = 5432
 * // Setting cache.enabled = true
 * 
 * // Convert to array when you need all entries at once
 * const allEntries = Array.from(HashMap.entries(config))
 * console.log(allEntries.length) // 3
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
const exportName = "entries";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Returns an `IterableIterator` of the entries within the `HashMap`.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\n// Create a configuration map\nconst config = HashMap.make(\n  [\"database.host\", \"localhost\"],\n  [\"database.port\", \"5432\"],\n  [\"cache.enabled\", \"true\"]\n)\n\n// Get entries iterator for processing\nconst entries = HashMap.entries(config)\n\n// Process each configuration entry\nfor (const [key, value] of entries) {\n  console.log(`Setting ${key} = ${value}`)\n}\n// Setting database.host = localhost\n// Setting database.port = 5432\n// Setting cache.enabled = true\n\n// Convert to array when you need all entries at once\nconst allEntries = Array.from(HashMap.entries(config))\nconsole.log(allEntries.length) // 3";
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
