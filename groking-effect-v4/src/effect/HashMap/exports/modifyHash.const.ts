/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: modifyHash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.825Z
 *
 * Overview:
 * Alter the value of the specified key in the `HashMap` using the specified update function. The value of the specified key will be computed using the provided hash.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 * 
 * // Useful when working with precomputed hashes for performance
 * const counters = HashMap.make(["downloads", 100], ["views", 250])
 * 
 * // Cache hash computation for frequently accessed keys
 * const metricKey = "downloads"
 * const cachedHash = Hash.string(metricKey)
 * 
 * // Update function that increments counter or initializes to 1
 * const incrementCounter = (current: Option.Option<number>) =>
 *   Option.isSome(current) ? Option.some(current.value + 1) : Option.some(1)
 * 
 * // Use cached hash for efficient updates in loops
 * const updated = HashMap.modifyHash(
 *   counters,
 *   metricKey,
 *   cachedHash,
 *   incrementCounter
 * )
 * console.log(HashMap.get(updated, "downloads")) // Option.some(101)
 * 
 * // Add new metric with precomputed hash
 * const newMetric = "clicks"
 * const clicksHash = Hash.string(newMetric)
 * const withClicks = HashMap.modifyHash(
 *   updated,
 *   newMetric,
 *   clicksHash,
 *   incrementCounter
 * )
 * console.log(HashMap.get(withClicks, "clicks")) // Option.some(1)
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
const exportName = "modifyHash";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Alter the value of the specified key in the `HashMap` using the specified update function. The value of the specified key will be computed using the provided hash.";
const sourceExample = "import { Hash } from \"effect\"\nimport * as HashMap from \"effect/HashMap\"\nimport * as Option from \"effect/Option\"\n\n// Useful when working with precomputed hashes for performance\nconst counters = HashMap.make([\"downloads\", 100], [\"views\", 250])\n\n// Cache hash computation for frequently accessed keys\nconst metricKey = \"downloads\"\nconst cachedHash = Hash.string(metricKey)\n\n// Update function that increments counter or initializes to 1\nconst incrementCounter = (current: Option.Option<number>) =>\n  Option.isSome(current) ? Option.some(current.value + 1) : Option.some(1)\n\n// Use cached hash for efficient updates in loops\nconst updated = HashMap.modifyHash(\n  counters,\n  metricKey,\n  cachedHash,\n  incrementCounter\n)\nconsole.log(HashMap.get(updated, \"downloads\")) // Option.some(101)\n\n// Add new metric with precomputed hash\nconst newMetric = \"clicks\"\nconst clicksHash = Hash.string(newMetric)\nconst withClicks = HashMap.modifyHash(\n  updated,\n  newMetric,\n  clicksHash,\n  incrementCounter\n)\nconsole.log(HashMap.get(withClicks, \"clicks\")) // Option.some(1)";
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
