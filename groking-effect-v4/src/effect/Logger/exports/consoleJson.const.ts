/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: consoleJson
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:50:37.426Z
 *
 * Overview:
 * A `Logger` which outputs logs using a structured format serialized as JSON on a single line and writes them to the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Use the console JSON logger
 * const jsonProgram = Effect.log("Hello JSON Console").pipe(
 *   Effect.provide(Logger.layer([Logger.consoleJson]))
 * )
 *
 * // Perfect for production logging and log aggregation
 * const productionProgram = Effect.gen(function*() {
 *   yield* Effect.log("Server started", { port: 3000, env: "production" })
 *   yield* Effect.logInfo("Request", {
 *     method: "POST",
 *     url: "/api/users",
 *     body: { name: "Alice" }
 *   })
 *   yield* Effect.logError("Database error", {
 *     error: "Connection timeout",
 *     retryCount: 3
 *   })
 * }).pipe(
 *   Effect.annotateLogs("service", "user-api"),
 *   Effect.annotateLogs("version", "1.2.3"),
 *   Effect.withLogSpan("request-processing"),
 *   Effect.provide(Logger.layer([Logger.consoleJson]))
 * )
 *
 * // Easy to pipe to log aggregation services
 * const productionSetup = Logger.layer([
 *   Logger.consoleJson, // For stdout JSON logs
 *   Logger.consolePretty() // For local debugging
 * ])
 *
 * // Ideal for containerized environments (Docker, Kubernetes)
 * const containerProgram = Effect.log("Container ready", {
 *   containerId: "abc123",
 *   image: "myapp:latest"
 * }).pipe(
 *   Effect.provide(Logger.layer([Logger.consoleJson]))
 * )
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "consoleJson";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary =
  "A `Logger` which outputs logs using a structured format serialized as JSON on a single line and writes them to the console.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Use the console JSON logger\nconst jsonProgram = Effect.log("Hello JSON Console").pipe(\n  Effect.provide(Logger.layer([Logger.consoleJson]))\n)\n\n// Perfect for production logging and log aggregation\nconst productionProgram = Effect.gen(function*() {\n  yield* Effect.log("Server started", { port: 3000, env: "production" })\n  yield* Effect.logInfo("Request", {\n    method: "POST",\n    url: "/api/users",\n    body: { name: "Alice" }\n  })\n  yield* Effect.logError("Database error", {\n    error: "Connection timeout",\n    retryCount: 3\n  })\n}).pipe(\n  Effect.annotateLogs("service", "user-api"),\n  Effect.annotateLogs("version", "1.2.3"),\n  Effect.withLogSpan("request-processing"),\n  Effect.provide(Logger.layer([Logger.consoleJson]))\n)\n\n// Easy to pipe to log aggregation services\nconst productionSetup = Logger.layer([\n  Logger.consoleJson, // For stdout JSON logs\n  Logger.consolePretty() // For local debugging\n])\n\n// Ideal for containerized environments (Docker, Kubernetes)\nconst containerProgram = Effect.log("Container ready", {\n  containerId: "abc123",\n  image: "myapp:latest"\n}).pipe(\n  Effect.provide(Logger.layer([Logger.consoleJson]))\n)';
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
