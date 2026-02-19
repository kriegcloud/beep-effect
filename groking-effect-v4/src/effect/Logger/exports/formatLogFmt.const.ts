/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: formatLogFmt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * A `Logger` which outputs logs using the [logfmt](https://brandur.org/logfmt) style.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 * 
 * // Use the logfmt format logger
 * const logfmtLoggerProgram = Effect.log("Hello LogFmt Format").pipe(
 *   Effect.provide(Logger.layer([Logger.formatLogFmt]))
 * )
 * 
 * // Perfect for structured logging systems
 * const structuredProgram = Effect.gen(function*() {
 *   yield* Effect.log("User login", { userId: 123, method: "OAuth" })
 *   yield* Effect.logInfo("Request processed", {
 *     duration: 45,
 *     status: "success"
 *   })
 * }).pipe(
 *   Effect.provide(Logger.layer([Logger.withConsoleLog(Logger.formatLogFmt)]))
 * )
 * 
 * // Good for log aggregation systems like Splunk, ELK
 * const productionLogger = Logger.formatLogFmt
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
const exportName = "formatLogFmt";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "A `Logger` which outputs logs using the [logfmt](https://brandur.org/logfmt) style.";
const sourceExample = "import { Effect, Logger } from \"effect\"\n\n// Use the logfmt format logger\nconst logfmtLoggerProgram = Effect.log(\"Hello LogFmt Format\").pipe(\n  Effect.provide(Logger.layer([Logger.formatLogFmt]))\n)\n\n// Perfect for structured logging systems\nconst structuredProgram = Effect.gen(function*() {\n  yield* Effect.log(\"User login\", { userId: 123, method: \"OAuth\" })\n  yield* Effect.logInfo(\"Request processed\", {\n    duration: 45,\n    status: \"success\"\n  })\n}).pipe(\n  Effect.provide(Logger.layer([Logger.withConsoleLog(Logger.formatLogFmt)]))\n)\n\n// Good for log aggregation systems like Splunk, ELK\nconst productionLogger = Logger.formatLogFmt";
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
