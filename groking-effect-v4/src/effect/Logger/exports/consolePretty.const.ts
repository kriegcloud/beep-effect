/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: consolePretty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.510Z
 *
 * Overview:
 * A `Logger` which outputs logs in a "pretty" format and writes them to the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 * 
 * // Use the pretty console logger with default settings
 * const basicPretty = Effect.log("Hello Pretty Format").pipe(
 *   Effect.provide(Logger.layer([Logger.consolePretty()]))
 * )
 * 
 * // Configure pretty logger options
 * const customPretty = Logger.consolePretty({
 *   colors: true,
 *   stderr: false,
 *   mode: "tty",
 *   formatDate: (date) => date.toLocaleTimeString()
 * })
 * 
 * // Perfect for development environment
 * const developmentProgram = Effect.gen(function*() {
 *   yield* Effect.log("Application starting")
 *   yield* Effect.logInfo("Database connected")
 *   yield* Effect.logWarning("High memory usage detected")
 * }).pipe(
 *   Effect.annotateLogs("environment", "development"),
 *   Effect.withLogSpan("startup"),
 *   Effect.provide(Logger.layer([customPretty]))
 * )
 * 
 * // Disable colors for CI/CD environments
 * const ciLogger = Logger.consolePretty({ colors: false })
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
const exportName = "consolePretty";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which outputs logs in a \"pretty\" format and writes them to the console.";
const sourceExample = "import { Effect, Logger } from \"effect\"\n\n// Use the pretty console logger with default settings\nconst basicPretty = Effect.log(\"Hello Pretty Format\").pipe(\n  Effect.provide(Logger.layer([Logger.consolePretty()]))\n)\n\n// Configure pretty logger options\nconst customPretty = Logger.consolePretty({\n  colors: true,\n  stderr: false,\n  mode: \"tty\",\n  formatDate: (date) => date.toLocaleTimeString()\n})\n\n// Perfect for development environment\nconst developmentProgram = Effect.gen(function*() {\n  yield* Effect.log(\"Application starting\")\n  yield* Effect.logInfo(\"Database connected\")\n  yield* Effect.logWarning(\"High memory usage detected\")\n}).pipe(\n  Effect.annotateLogs(\"environment\", \"development\"),\n  Effect.withLogSpan(\"startup\"),\n  Effect.provide(Logger.layer([customPretty]))\n)\n\n// Disable colors for CI/CD environments\nconst ciLogger = Logger.consolePretty({ colors: false })";
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
