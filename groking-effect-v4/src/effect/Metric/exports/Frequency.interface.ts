/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: Frequency
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * A Frequency metric interface that counts occurrences of discrete string values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class FrequencyInterfaceError
 *   extends Data.TaggedError("FrequencyInterfaceError")<{
 *     readonly operation: string
 *   }>
 * {}
 * 
 * // Function that accepts any Frequency metric
 * const logFrequencyMetric = (freq: Metric.Frequency) =>
 *   Effect.gen(function*() {
 *     const state = yield* Metric.value(freq)
 * 
 *     yield* Effect.log(`Frequency Metric: ${freq.id}`)
 *     yield* Effect.log(`Description: ${freq.description ?? "No description"}`)
 *     yield* Effect.log(`Type: ${freq.type}`) // "Frequency"
 * 
 *     // Access the frequency state
 *     const occurrences: ReadonlyMap<string, number> = state.occurrences
 *     yield* Effect.log(`Total unique values: ${occurrences.size}`)
 * 
 *     // Iterate through all occurrences
 *     for (const [value, count] of occurrences) {
 *       yield* Effect.log(`  "${value}": ${count} occurrences`)
 *     }
 * 
 *     // Find most frequent value
 *     let maxCount = 0
 *     let mostFrequent = ""
 *     for (const [value, count] of occurrences) {
 *       if (count > maxCount) {
 *         maxCount = count
 *         mostFrequent = value
 *       }
 *     }
 * 
 *     return { mostFrequent, maxCount, totalUniqueValues: occurrences.size }
 *   })
 * 
 * const program = Effect.gen(function*() {
 *   // Create frequency metrics
 *   const statusCodes: Metric.Frequency = Metric.frequency("http_status", {
 *     description: "HTTP status code frequency"
 *   })
 * 
 *   const userActions: Metric.Frequency = Metric.frequency("user_actions", {
 *     description: "User action frequency"
 *   })
 * 
 *   // Record some occurrences
 *   yield* Metric.update(statusCodes, "200")
 *   yield* Metric.update(statusCodes, "200")
 *   yield* Metric.update(statusCodes, "404")
 *   yield* Metric.update(statusCodes, "500")
 *   yield* Metric.update(statusCodes, "200")
 * 
 *   yield* Metric.update(userActions, "login")
 *   yield* Metric.update(userActions, "view_dashboard")
 *   yield* Metric.update(userActions, "login")
 * 
 *   // Use the function with different frequency metrics
 *   const statusAnalysis = yield* logFrequencyMetric(statusCodes)
 *   const actionAnalysis = yield* logFrequencyMetric(userActions)
 * 
 *   return { statusAnalysis, actionAnalysis }
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MetricModule from "effect/Metric";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Frequency";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A Frequency metric interface that counts occurrences of discrete string values.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass FrequencyInterfaceError\n  extends Data.TaggedError(\"FrequencyInterfaceError\")<{\n    readonly operation: string\n  }>\n{}\n\n// Function that accepts any Frequency metric\nconst logFrequencyMetric = (freq: Metric.Frequency) =>\n  Effect.gen(function*() {\n    const state = yield* Metric.value(freq)\n\n    yield* Effect.log(`Frequency Metric: ${freq.id}`)\n    yield* Effect.log(`Description: ${freq.description ?? \"No description\"}`)\n    yield* Effect.log(`Type: ${freq.type}`) // \"Frequency\"\n\n    // Access the frequency state\n    const occurrences: ReadonlyMap<string, number> = state.occurrences\n    yield* Effect.log(`Total unique values: ${occurrences.size}`)\n\n    // Iterate through all occurrences\n    for (const [value, count] of occurrences) {\n      yield* Effect.log(`  \"${value}\": ${count} occurrences`)\n    }\n\n    // Find most frequent value\n    let maxCount = 0\n    let mostFrequent = \"\"\n    for (const [value, count] of occurrences) {\n      if (count > maxCount) {\n        maxCount = count\n        mostFrequent = value\n      }\n    }\n\n    return { mostFrequent, maxCount, totalUniqueValues: occurrences.size }\n  })\n\nconst program = Effect.gen(function*() {\n  // Create frequency metrics\n  const statusCodes: Metric.Frequency = Metric.frequency(\"http_status\", {\n    description: \"HTTP status code frequency\"\n  })\n\n  const userActions: Metric.Frequency = Metric.frequency(\"user_actions\", {\n    description: \"User action frequency\"\n  })\n\n  // Record some occurrences\n  yield* Metric.update(statusCodes, \"200\")\n  yield* Metric.update(statusCodes, \"200\")\n  yield* Metric.update(statusCodes, \"404\")\n  yield* Metric.update(statusCodes, \"500\")\n  yield* Metric.update(statusCodes, \"200\")\n\n  yield* Metric.update(userActions, \"login\")\n  yield* Metric.update(userActions, \"view_dashboard\")\n  yield* Metric.update(userActions, \"login\")\n\n  // Use the function with different frequency metrics\n  const statusAnalysis = yield* logFrequencyMetric(statusCodes)\n  const actionAnalysis = yield* logFrequencyMetric(userActions)\n\n  return { statusAnalysis, actionAnalysis }\n})";
const moduleRecord = MetricModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
