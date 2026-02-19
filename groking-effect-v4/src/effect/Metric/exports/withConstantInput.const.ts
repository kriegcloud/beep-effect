/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: withConstantInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Returns a new metric that is powered by this one, but which accepts updates of any type, and translates them to updates with the specified constant update value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class MetricError extends Data.TaggedError("MetricError")<{
 *   readonly operation: string
 * }> {}
 * 
 * // Create a counter that normally expects a number increment
 * const requestCounter = Metric.counter("total_requests", {
 *   description: "Total number of requests processed"
 * })
 * 
 * // Create a version that always increments by 1, regardless of input
 * const simpleRequestCounter = Metric.withConstantInput(requestCounter, 1)
 * 
 * const program = Effect.gen(function*() {
 *   // These all increment the counter by 1, ignoring the input value
 *   yield* Metric.update(simpleRequestCounter, "any string")
 *   yield* Metric.update(simpleRequestCounter, { complex: "object" })
 *   yield* Metric.update(simpleRequestCounter, 999) // Still increments by 1
 * 
 *   const value = yield* Metric.value(simpleRequestCounter)
 *   return value // Counter state will show count: 3
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
const exportName = "withConstantInput";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Returns a new metric that is powered by this one, but which accepts updates of any type, and translates them to updates with the specified constant update value.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass MetricError extends Data.TaggedError(\"MetricError\")<{\n  readonly operation: string\n}> {}\n\n// Create a counter that normally expects a number increment\nconst requestCounter = Metric.counter(\"total_requests\", {\n  description: \"Total number of requests processed\"\n})\n\n// Create a version that always increments by 1, regardless of input\nconst simpleRequestCounter = Metric.withConstantInput(requestCounter, 1)\n\nconst program = Effect.gen(function*() {\n  // These all increment the counter by 1, ignoring the input value\n  yield* Metric.update(simpleRequestCounter, \"any string\")\n  yield* Metric.update(simpleRequestCounter, { complex: \"object\" })\n  yield* Metric.update(simpleRequestCounter, 999) // Still increments by 1\n\n  const value = yield* Metric.value(simpleRequestCounter)\n  return value // Counter state will show count: 3\n})";
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
