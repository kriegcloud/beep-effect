/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: withAttributes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Returns a new metric that applies the specified attributes to all operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const requestCounter = Metric.counter("http_requests_total", {
 *   description: "Total HTTP requests"
 * })
 *
 * // Create tagged versions of the metric
 * const getRequests = Metric.withAttributes(requestCounter, {
 *   method: "GET",
 *   endpoint: "/api/users"
 * })
 *
 * const postRequests = Metric.withAttributes(requestCounter, {
 *   method: "POST",
 *   endpoint: "/api/users"
 * })
 *
 * const program = Effect.gen(function*() {
 *   // These will be tracked as separate metric series
 *   yield* Metric.update(getRequests, 1) // http_requests_total{method="GET", endpoint="/api/users"}
 *   yield* Metric.update(postRequests, 1) // http_requests_total{method="POST", endpoint="/api/users"}
 *   yield* Metric.update(getRequests, 1) // Increments the GET counter
 *
 *   // You can also chain attributes
 *   const taggedMetric = requestCounter.pipe(
 *     Metric.withAttributes({ service: "user-api" }),
 *     Metric.withAttributes({ version: "v1" })
 *   )
 *
 *   yield* Metric.update(taggedMetric, 1) // http_requests_total{service="user-api", version="v1"}
 * })
 *
 * // When taking snapshots, each attribute combination appears as a separate metric
 * const viewMetrics = Effect.gen(function*() {
 *   const snapshots = yield* Metric.snapshot
 *   for (const metric of snapshots) {
 *     if (metric.id === "http_requests_total") {
 *       console.log(`${metric.id}`, metric.attributes, metric.state)
 *     }
 *   }
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withAttributes";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Returns a new metric that applies the specified attributes to all operations.";
const sourceExample =
  'import { Effect, Metric } from "effect"\n\nconst requestCounter = Metric.counter("http_requests_total", {\n  description: "Total HTTP requests"\n})\n\n// Create tagged versions of the metric\nconst getRequests = Metric.withAttributes(requestCounter, {\n  method: "GET",\n  endpoint: "/api/users"\n})\n\nconst postRequests = Metric.withAttributes(requestCounter, {\n  method: "POST",\n  endpoint: "/api/users"\n})\n\nconst program = Effect.gen(function*() {\n  // These will be tracked as separate metric series\n  yield* Metric.update(getRequests, 1) // http_requests_total{method="GET", endpoint="/api/users"}\n  yield* Metric.update(postRequests, 1) // http_requests_total{method="POST", endpoint="/api/users"}\n  yield* Metric.update(getRequests, 1) // Increments the GET counter\n\n  // You can also chain attributes\n  const taggedMetric = requestCounter.pipe(\n    Metric.withAttributes({ service: "user-api" }),\n    Metric.withAttributes({ version: "v1" })\n  )\n\n  yield* Metric.update(taggedMetric, 1) // http_requests_total{service="user-api", version="v1"}\n})\n\n// When taking snapshots, each attribute combination appears as a separate metric\nconst viewMetrics = Effect.gen(function*() {\n  const snapshots = yield* Metric.snapshot\n  for (const metric of snapshots) {\n    if (metric.id === "http_requests_total") {\n      console.log(`${metric.id}`, metric.attributes, metric.state)\n    }\n  }\n})';
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
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
