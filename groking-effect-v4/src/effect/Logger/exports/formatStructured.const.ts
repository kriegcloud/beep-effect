/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: formatStructured
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * A `Logger` which outputs logs using a structured format.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 * 
 * // Use the structured format logger
 * const structuredLoggerProgram = Effect.log("Hello Structured Format").pipe(
 *   Effect.provide(Logger.layer([Logger.formatStructured]))
 * )
 * 
 * // Perfect for JSON processing and analytics
 * const analyticsProgram = Effect.gen(function*() {
 *   yield* Effect.log("User action", { action: "click", element: "button" })
 *   yield* Effect.logInfo("API call", { endpoint: "/users", duration: 150 })
 * }).pipe(
 *   Effect.annotateLogs("sessionId", "abc123"),
 *   Effect.withLogSpan("request"),
 *   Effect.provide(Logger.layer([Logger.formatStructured]))
 * )
 * 
 * // Process structured output
 * const processingLogger = Logger.map(Logger.formatStructured, (output) => {
 *   // Process the structured object
 *   const enhanced = { ...output, processed: true }
 *   return enhanced
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
const exportName = "formatStructured";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which outputs logs using a structured format.";
const sourceExample = "import { Effect, Logger } from \"effect\"\n\n// Use the structured format logger\nconst structuredLoggerProgram = Effect.log(\"Hello Structured Format\").pipe(\n  Effect.provide(Logger.layer([Logger.formatStructured]))\n)\n\n// Perfect for JSON processing and analytics\nconst analyticsProgram = Effect.gen(function*() {\n  yield* Effect.log(\"User action\", { action: \"click\", element: \"button\" })\n  yield* Effect.logInfo(\"API call\", { endpoint: \"/users\", duration: 150 })\n}).pipe(\n  Effect.annotateLogs(\"sessionId\", \"abc123\"),\n  Effect.withLogSpan(\"request\"),\n  Effect.provide(Logger.layer([Logger.formatStructured]))\n)\n\n// Process structured output\nconst processingLogger = Logger.map(Logger.formatStructured, (output) => {\n  // Process the structured object\n  const enhanced = { ...output, processed: true }\n  return enhanced\n})";
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
