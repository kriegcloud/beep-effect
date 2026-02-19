/**
 * Export Playground
 *
 * Package: @effect/opentelemetry
 * Module: @effect/opentelemetry/Metrics
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/opentelemetry/src/Metrics.ts
 * Generated: 2026-02-19T04:13:59.993Z
 *
 * Overview:
 * Creates a Layer that registers a metric producer with metric readers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Metrics } from "@effect/opentelemetry"
 * import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
 * import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
 * 
 * const metricExporter = new OTLPMetricExporter({ url: "<your-otel-url>" })
 * 
 * // Use delta temporality for backends like Datadog or Dynatrace
 * const metricsLayer = Metrics.layer(
 *   () => new PeriodicExportingMetricReader({
 *     exporter: metricExporter,
 *     exportIntervalMillis: 10000
 *   }),
 *   { temporality: "delta" }
 * )
 * 
 * // Use cumulative temporality for backends like Prometheus (default)
 * const cumulativeLayer = Metrics.layer(
 *   () => new PeriodicExportingMetricReader({ exporter: metricExporter }),
 *   { temporality: "cumulative" }
 * )
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
import * as MetricsModule from "@effect/opentelemetry/Metrics";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "@effect/opentelemetry/Metrics";
const sourceSummary = "Creates a Layer that registers a metric producer with metric readers.";
const sourceExample = "import { Metrics } from \"@effect/opentelemetry\"\nimport { PeriodicExportingMetricReader } from \"@opentelemetry/sdk-metrics\"\nimport { OTLPMetricExporter } from \"@opentelemetry/exporter-metrics-otlp-http\"\n\nconst metricExporter = new OTLPMetricExporter({ url: \"<your-otel-url>\" })\n\n// Use delta temporality for backends like Datadog or Dynatrace\nconst metricsLayer = Metrics.layer(\n  () => new PeriodicExportingMetricReader({\n    exporter: metricExporter,\n    exportIntervalMillis: 10000\n  }),\n  { temporality: \"delta\" }\n)\n\n// Use cumulative temporality for backends like Prometheus (default)\nconst cumulativeLayer = Metrics.layer(\n  () => new PeriodicExportingMetricReader({ exporter: metricExporter }),\n  { temporality: \"cumulative\" }\n)";
const moduleRecord = MetricsModule as Record<string, unknown>;

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
