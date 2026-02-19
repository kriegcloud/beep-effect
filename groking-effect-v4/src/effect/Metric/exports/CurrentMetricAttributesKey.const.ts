/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: CurrentMetricAttributesKey
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Service key for the current metric attributes context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class AttributesKeyError extends Data.TaggedError("AttributesKeyError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // The key is used internally by the Effect runtime to manage metric attributes
 *   const key = Metric.CurrentMetricAttributesKey
 * 
 *   // Create metrics with base attributes
 *   const requestCounter = Metric.counter("requests_total", {
 *     description: "Total HTTP requests"
 *   })
 * 
 *   // The CurrentMetricAttributes service provides default attributes
 *   // that get applied to all metrics in the current context
 *   const baseAttributes = { service: "api", version: "1.0" }
 * 
 *   // Use withAttributes to apply attributes to metrics
 *   const taggedCounter1 = Metric.withAttributes(requestCounter, baseAttributes)
 *   const program1 = Metric.update(taggedCounter1, 1)
 * 
 *   const taggedCounter2 = Metric.withAttributes(requestCounter, {
 *     ...baseAttributes,
 *     endpoint: "/users"
 *   })
 *   const program2 = Metric.update(taggedCounter2, 5)
 * 
 *   yield* program1
 *   yield* program2
 * 
 *   return {
 *     keyValue: key, // "effect/Metric/CurrentMetricAttributes"
 *     keyType: typeof key, // "string"
 *     isConstant: key === "effect/Metric/CurrentMetricAttributes" // true
 *   }
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
const exportName = "CurrentMetricAttributesKey";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Service key for the current metric attributes context.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass AttributesKeyError extends Data.TaggedError(\"AttributesKeyError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // The key is used internally by the Effect runtime to manage metric attributes\n  const key = Metric.CurrentMetricAttributesKey\n\n  // Create metrics with base attributes\n  const requestCounter = Metric.counter(\"requests_total\", {\n    description: \"Total HTTP requests\"\n  })\n\n  // The CurrentMetricAttributes service provides default attributes\n  // that get applied to all metrics in the current context\n  const baseAttributes = { service: \"api\", version: \"1.0\" }\n\n  // Use withAttributes to apply attributes to metrics\n  const taggedCounter1 = Metric.withAttributes(requestCounter, baseAttributes)\n  const program1 = Metric.update(taggedCounter1, 1)\n\n  const taggedCounter2 = Metric.withAttributes(requestCounter, {\n    ...baseAttributes,\n    endpoint: \"/users\"\n  })\n  const program2 = Metric.update(taggedCounter2, 5)\n\n  yield* program1\n  yield* program2\n\n  return {\n    keyValue: key, // \"effect/Metric/CurrentMetricAttributes\"\n    keyType: typeof key, // \"string\"\n    isConstant: key === \"effect/Metric/CurrentMetricAttributes\" // true\n  }\n})";
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
