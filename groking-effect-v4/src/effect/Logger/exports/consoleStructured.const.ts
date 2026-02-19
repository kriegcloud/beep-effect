/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: consoleStructured
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.510Z
 *
 * Overview:
 * A `Logger` which outputs logs using a strctured format and writes them to the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 * 
 * // Use the console structured logger
 * const structuredProgram = Effect.log("Hello Structured Console").pipe(
 *   Effect.provide(Logger.layer([Logger.consoleStructured]))
 * )
 * 
 * // Perfect for development debugging
 * const debugProgram = Effect.gen(function*() {
 *   yield* Effect.log("User event", {
 *     userId: 123,
 *     action: "login",
 *     ip: "192.168.1.1"
 *   })
 *   yield* Effect.logInfo("API call", {
 *     endpoint: "/users",
 *     method: "GET",
 *     duration: 120
 *   })
 * }).pipe(
 *   Effect.annotateLogs("requestId", "req-123"),
 *   Effect.withLogSpan("authentication"),
 *   Effect.provide(Logger.layer([Logger.consoleStructured]))
 * )
 * 
 * // Easy to parse and inspect object structure
 * const inspectionProgram = Effect.gen(function*() {
 *   yield* Effect.log("Complex data", {
 *     user: { id: 1, name: "John" },
 *     metadata: { source: "api", version: 2 }
 *   })
 * }).pipe(
 *   Effect.provide(Logger.layer([Logger.consoleStructured]))
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
import * as LoggerModule from "effect/Logger";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "consoleStructured";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which outputs logs using a strctured format and writes them to the console.";
const sourceExample = "import { Effect, Logger } from \"effect\"\n\n// Use the console structured logger\nconst structuredProgram = Effect.log(\"Hello Structured Console\").pipe(\n  Effect.provide(Logger.layer([Logger.consoleStructured]))\n)\n\n// Perfect for development debugging\nconst debugProgram = Effect.gen(function*() {\n  yield* Effect.log(\"User event\", {\n    userId: 123,\n    action: \"login\",\n    ip: \"192.168.1.1\"\n  })\n  yield* Effect.logInfo(\"API call\", {\n    endpoint: \"/users\",\n    method: \"GET\",\n    duration: 120\n  })\n}).pipe(\n  Effect.annotateLogs(\"requestId\", \"req-123\"),\n  Effect.withLogSpan(\"authentication\"),\n  Effect.provide(Logger.layer([Logger.consoleStructured]))\n)\n\n// Easy to parse and inspect object structure\nconst inspectionProgram = Effect.gen(function*() {\n  yield* Effect.log(\"Complex data\", {\n    user: { id: 1, name: \"John\" },\n    metadata: { source: \"api\", version: 2 }\n  })\n}).pipe(\n  Effect.provide(Logger.layer([Logger.consoleStructured]))\n)";
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
