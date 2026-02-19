/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: FrequencyState
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * State interface for Frequency metrics containing occurrence counts for discrete string values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class FrequencyStateError extends Data.TaggedError("FrequencyStateError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create frequency metrics for different categories
 *   const statusCodeFreq = Metric.frequency("http_status_codes", {
 *     description: "HTTP status code distribution"
 *   })
 *
 *   const userActionFreq = Metric.frequency("user_actions", {
 *     description: "User action frequency"
 *   })
 *
 *   // Record occurrences
 *   yield* Metric.update(statusCodeFreq, "200") // Success
 *   yield* Metric.update(statusCodeFreq, "200") // Another success
 *   yield* Metric.update(statusCodeFreq, "404") // Not found
 *   yield* Metric.update(statusCodeFreq, "500") // Server error
 *   yield* Metric.update(statusCodeFreq, "200") // Another success
 *
 *   yield* Metric.update(userActionFreq, "login")
 *   yield* Metric.update(userActionFreq, "click")
 *   yield* Metric.update(userActionFreq, "login")
 *   yield* Metric.update(userActionFreq, "scroll")
 *   yield* Metric.update(userActionFreq, "click")
 *   yield* Metric.update(userActionFreq, "click")
 *
 *   // Read frequency states
 *   const statusState: Metric.FrequencyState = yield* Metric.value(statusCodeFreq)
 *   const actionState: Metric.FrequencyState = yield* Metric.value(userActionFreq)
 *
 *   // FrequencyState contains:
 *   // - occurrences: ReadonlyMap<string, number> with string values and their counts
 *
 *   // Analyze frequency distributions
 *   const getMostFrequent = (occurrences: ReadonlyMap<string, number>) => {
 *     let maxKey = ""
 *     let maxCount = 0
 *     for (const [key, count] of occurrences) {
 *       if (count > maxCount) {
 *         maxKey = key
 *         maxCount = count
 *       }
 *     }
 *     return { key: maxKey, count: maxCount }
 *   }
 *
 *   const topStatus = getMostFrequent(statusState.occurrences)
 *   const topAction = getMostFrequent(actionState.occurrences)
 *
 *   return {
 *     statusCodes: {
 *       totalResponses: Array.from(statusState.occurrences.values()).reduce(
 *         (a, b) => a + b,
 *         0
 *       ), // 5
 *       mostCommon: topStatus, // { key: "200", count: 3 }
 *       uniqueCodes: statusState.occurrences.size // 3
 *     },
 *     userActions: {
 *       totalActions: Array.from(actionState.occurrences.values()).reduce(
 *         (a, b) => a + b,
 *         0
 *       ), // 6
 *       mostCommon: topAction, // { key: "click", count: 3 }
 *       uniqueActions: actionState.occurrences.size // 3
 *     }
 *   }
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FrequencyState";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "State interface for Frequency metrics containing occurrence counts for discrete string values.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass FrequencyStateError extends Data.TaggedError("FrequencyStateError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create frequency metrics for different categories\n  const statusCodeFreq = Metric.frequency("http_status_codes", {\n    description: "HTTP status code distribution"\n  })\n\n  const userActionFreq = Metric.frequency("user_actions", {\n    description: "User action frequency"\n  })\n\n  // Record occurrences\n  yield* Metric.update(statusCodeFreq, "200") // Success\n  yield* Metric.update(statusCodeFreq, "200") // Another success\n  yield* Metric.update(statusCodeFreq, "404") // Not found\n  yield* Metric.update(statusCodeFreq, "500") // Server error\n  yield* Metric.update(statusCodeFreq, "200") // Another success\n\n  yield* Metric.update(userActionFreq, "login")\n  yield* Metric.update(userActionFreq, "click")\n  yield* Metric.update(userActionFreq, "login")\n  yield* Metric.update(userActionFreq, "scroll")\n  yield* Metric.update(userActionFreq, "click")\n  yield* Metric.update(userActionFreq, "click")\n\n  // Read frequency states\n  const statusState: Metric.FrequencyState = yield* Metric.value(statusCodeFreq)\n  const actionState: Metric.FrequencyState = yield* Metric.value(userActionFreq)\n\n  // FrequencyState contains:\n  // - occurrences: ReadonlyMap<string, number> with string values and their counts\n\n  // Analyze frequency distributions\n  const getMostFrequent = (occurrences: ReadonlyMap<string, number>) => {\n    let maxKey = ""\n    let maxCount = 0\n    for (const [key, count] of occurrences) {\n      if (count > maxCount) {\n        maxKey = key\n        maxCount = count\n      }\n    }\n    return { key: maxKey, count: maxCount }\n  }\n\n  const topStatus = getMostFrequent(statusState.occurrences)\n  const topAction = getMostFrequent(actionState.occurrences)\n\n  return {\n    statusCodes: {\n      totalResponses: Array.from(statusState.occurrences.values()).reduce(\n        (a, b) => a + b,\n        0\n      ), // 5\n      mostCommon: topStatus, // { key: "200", count: 3 }\n      uniqueCodes: statusState.occurrences.size // 3\n    },\n    userActions: {\n      totalActions: Array.from(actionState.occurrences.values()).reduce(\n        (a, b) => a + b,\n        0\n      ), // 6\n      mostCommon: topAction, // { key: "click", count: 3 }\n      uniqueActions: actionState.occurrences.size // 3\n    }\n  }\n})';
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
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
