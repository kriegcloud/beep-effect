/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: CurrentMetricAttributes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Service class for managing the current metric attributes context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class AttributesError extends Data.TaggedError("AttributesError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Access current metric attributes
 *   const attributes = yield* Metric.CurrentMetricAttributes
 *   console.log("Current attributes:", attributes)
 * 
 *   // Set new attributes context
 *   const newAttributes = { service: "api", version: "1.0" }
 *   const result = yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const updatedAttributes = yield* Metric.CurrentMetricAttributes
 *       return updatedAttributes
 *     }),
 *     Metric.CurrentMetricAttributes,
 *     newAttributes
 *   )
 * 
 *   return result
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
const exportName = "CurrentMetricAttributes";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Service class for managing the current metric attributes context.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass AttributesError extends Data.TaggedError(\"AttributesError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Access current metric attributes\n  const attributes = yield* Metric.CurrentMetricAttributes\n  console.log(\"Current attributes:\", attributes)\n\n  // Set new attributes context\n  const newAttributes = { service: \"api\", version: \"1.0\" }\n  const result = yield* Effect.provideService(\n    Effect.gen(function*() {\n      const updatedAttributes = yield* Metric.CurrentMetricAttributes\n      return updatedAttributes\n    }),\n    Metric.CurrentMetricAttributes,\n    newAttributes\n  )\n\n  return result\n})";
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
