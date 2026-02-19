/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: formatJson
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.510Z
 *
 * Overview:
 * A `Logger` which outputs logs using a structured format serialized as JSON on a single line.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 * 
 * // Use the JSON format logger
 * const jsonLoggerProgram = Effect.log("Hello JSON Format").pipe(
 *   Effect.provide(Logger.layer([Logger.formatJson]))
 * )
 * 
 * // Perfect for log aggregation and processing systems
 * const productionProgram = Effect.gen(function*() {
 *   yield* Effect.log("Server started", { port: 3000, env: "production" })
 *   yield* Effect.logInfo("Request received", {
 *     method: "GET",
 *     path: "/api/users"
 *   })
 *   yield* Effect.logError("Database error", { error: "Connection timeout" })
 * }).pipe(
 *   Effect.annotateLogs("service", "api-server"),
 *   Effect.withLogSpan("request-processing"),
 *   Effect.provide(Logger.layer([Logger.formatJson]))
 * )
 * 
 * // Send to external logging service
 * const externalLogger = Logger.map(Logger.formatJson, (jsonString) => {
 *   // Send to Elasticsearch, CloudWatch, etc.
 *   console.log("Sending to external service:", jsonString)
 *   return jsonString
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
import * as LoggerModule from "effect/Logger";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "formatJson";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which outputs logs using a structured format serialized as JSON on a single line.";
const sourceExample = "import { Effect, Logger } from \"effect\"\n\n// Use the JSON format logger\nconst jsonLoggerProgram = Effect.log(\"Hello JSON Format\").pipe(\n  Effect.provide(Logger.layer([Logger.formatJson]))\n)\n\n// Perfect for log aggregation and processing systems\nconst productionProgram = Effect.gen(function*() {\n  yield* Effect.log(\"Server started\", { port: 3000, env: \"production\" })\n  yield* Effect.logInfo(\"Request received\", {\n    method: \"GET\",\n    path: \"/api/users\"\n  })\n  yield* Effect.logError(\"Database error\", { error: \"Connection timeout\" })\n}).pipe(\n  Effect.annotateLogs(\"service\", \"api-server\"),\n  Effect.withLogSpan(\"request-processing\"),\n  Effect.provide(Logger.layer([Logger.formatJson]))\n)\n\n// Send to external logging service\nconst externalLogger = Logger.map(Logger.formatJson, (jsonString) => {\n  // Send to Elasticsearch, CloudWatch, etc.\n  console.log(\"Sending to external service:\", jsonString)\n  return jsonString\n})";
const moduleRecord = LoggerModule as Record<string, unknown>;

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
