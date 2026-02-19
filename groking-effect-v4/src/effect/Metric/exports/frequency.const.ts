/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: frequency
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * Creates a `Frequency` metric which can be used to count the number of occurrences of a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class FrequencyError extends Data.TaggedError("FrequencyError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create a frequency metric for HTTP status codes
 *   const statusFrequency = Metric.frequency("http_status_codes", {
 *     description: "Frequency of HTTP response status codes",
 *     preregisteredWords: ["200", "404", "500"] // Pre-register common codes
 *   })
 * 
 *   // Create a frequency metric for user actions
 *   const userActionFrequency = Metric.frequency("user_actions", {
 *     description: "Frequency of user actions performed",
 *     attributes: { application: "web-app" }
 *   })
 * 
 *   // Create a frequency metric for error types
 *   const errorTypeFrequency = Metric.frequency("error_types", {
 *     description: "Frequency of different error types"
 *   })
 * 
 *   // Record different occurrences
 *   yield* Metric.update(statusFrequency, "200") // Success response
 *   yield* Metric.update(statusFrequency, "200") // Another success
 *   yield* Metric.update(statusFrequency, "404") // Not found error
 *   yield* Metric.update(statusFrequency, "500") // Server error
 *   yield* Metric.update(statusFrequency, "200") // Another success
 * 
 *   yield* Metric.update(userActionFrequency, "login")
 *   yield* Metric.update(userActionFrequency, "view_dashboard")
 *   yield* Metric.update(userActionFrequency, "login")
 *   yield* Metric.update(userActionFrequency, "logout")
 * 
 *   yield* Metric.update(errorTypeFrequency, "ValidationError")
 *   yield* Metric.update(errorTypeFrequency, "NetworkError")
 *   yield* Metric.update(errorTypeFrequency, "ValidationError")
 * 
 *   // Get frequency counts
 *   const statusCounts = yield* Metric.value(statusFrequency)
 *   const actionCounts = yield* Metric.value(userActionFrequency)
 *   const errorCounts = yield* Metric.value(errorTypeFrequency)
 * 
 *   // statusCounts.occurrences will be:
 *   // Map { "200" => 3, "404" => 1, "500" => 1 }
 *   // actionCounts.occurrences will be:
 *   // Map { "login" => 2, "view_dashboard" => 1, "logout" => 1 }
 *   // errorCounts.occurrences will be:
 *   // Map { "ValidationError" => 2, "NetworkError" => 1 }
 * 
 *   return { statusCounts, actionCounts, errorCounts }
 * })
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
import * as MetricModule from "effect/Metric";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "frequency";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Creates a `Frequency` metric which can be used to count the number of occurrences of a string.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass FrequencyError extends Data.TaggedError(\"FrequencyError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a frequency metric for HTTP status codes\n  const statusFrequency = Metric.frequency(\"http_status_codes\", {\n    description: \"Frequency of HTTP response status codes\",\n    preregisteredWords: [\"200\", \"404\", \"500\"] // Pre-register common codes\n  })\n\n  // Create a frequency metric for user actions\n  const userActionFrequency = Metric.frequency(\"user_actions\", {\n    description: \"Frequency of user actions performed\",\n    attributes: { application: \"web-app\" }\n  })\n\n  // Create a frequency metric for error types\n  const errorTypeFrequency = Metric.frequency(\"error_types\", {\n    description: \"Frequency of different error types\"\n  })\n\n  // Record different occurrences\n  yield* Metric.update(statusFrequency, \"200\") // Success response\n  yield* Metric.update(statusFrequency, \"200\") // Another success\n  yield* Metric.update(statusFrequency, \"404\") // Not found error\n  yield* Metric.update(statusFrequency, \"500\") // Server error\n  yield* Metric.update(statusFrequency, \"200\") // Another success\n\n  yield* Metric.update(userActionFrequency, \"login\")\n  yield* Metric.update(userActionFrequency, \"view_dashboard\")\n  yield* Metric.update(userActionFrequency, \"login\")\n  yield* Metric.update(userActionFrequency, \"logout\")\n\n  yield* Metric.update(errorTypeFrequency, \"ValidationError\")\n  yield* Metric.update(errorTypeFrequency, \"NetworkError\")\n  yield* Metric.update(errorTypeFrequency, \"ValidationError\")\n\n  // Get frequency counts\n  const statusCounts = yield* Metric.value(statusFrequency)\n  const actionCounts = yield* Metric.value(userActionFrequency)\n  const errorCounts = yield* Metric.value(errorTypeFrequency)\n\n  // statusCounts.occurrences will be:\n  // Map { \"200\" => 3, \"404\" => 1, \"500\" => 1 }\n  // actionCounts.occurrences will be:\n  // Map { \"login\" => 2, \"view_dashboard\" => 1, \"logout\" => 1 }\n  // errorCounts.occurrences will be:\n  // Map { \"ValidationError\" => 2, \"NetworkError\" => 1 }\n\n  return { statusCounts, actionCounts, errorCounts }\n})";
const moduleRecord = MetricModule as Record<string, unknown>;

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
