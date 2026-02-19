/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: MinimumLogLevel
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:14:16.490Z
 *
 * Overview:
 * Reference for setting the minimum log level threshold. Log entries below this level will be filtered out completely.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, References } from "effect"
 *
 * const configureMinimumLogging = Effect.gen(function*() {
 *   // Get current minimum level (default is "Info")
 *   const current = yield* References.MinimumLogLevel
 *   console.log(current) // "Info"
 *
 *   // Set minimum level to Warn - Debug and Info will be filtered
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const minLevel = yield* References.MinimumLogLevel
 *       console.log(minLevel) // "Warn"
 *
 *       // These won't be processed at all
 *       yield* Console.debug("Debug message") // Filtered out
 *       yield* Console.info("Info message") // Filtered out
 *
 *       // These will be processed
 *       yield* Console.warn("Warning message") // Shown
 *       yield* Console.error("Error message") // Shown
 *     }),
 *     References.MinimumLogLevel,
 *     "Warn"
 *   )
 *
 *   // Reset to default Info level
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const minLevel = yield* References.MinimumLogLevel
 *       console.log(minLevel) // "Info"
 *
 *       // Now info messages will be processed
 *       yield* Console.info("Info message") // Shown
 *     }),
 *     References.MinimumLogLevel,
 *     "Info"
 *   )
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
import * as ReferencesModule from "effect/References";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MinimumLogLevel";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary =
  "Reference for setting the minimum log level threshold. Log entries below this level will be filtered out completely.";
const sourceExample =
  'import { Console, Effect, References } from "effect"\n\nconst configureMinimumLogging = Effect.gen(function*() {\n  // Get current minimum level (default is "Info")\n  const current = yield* References.MinimumLogLevel\n  console.log(current) // "Info"\n\n  // Set minimum level to Warn - Debug and Info will be filtered\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const minLevel = yield* References.MinimumLogLevel\n      console.log(minLevel) // "Warn"\n\n      // These won\'t be processed at all\n      yield* Console.debug("Debug message") // Filtered out\n      yield* Console.info("Info message") // Filtered out\n\n      // These will be processed\n      yield* Console.warn("Warning message") // Shown\n      yield* Console.error("Error message") // Shown\n    }),\n    References.MinimumLogLevel,\n    "Warn"\n  )\n\n  // Reset to default Info level\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const minLevel = yield* References.MinimumLogLevel\n      console.log(minLevel) // "Info"\n\n      // Now info messages will be processed\n      yield* Console.info("Info message") // Shown\n    }),\n    References.MinimumLogLevel,\n    "Info"\n  )\n})';
const moduleRecord = ReferencesModule as Record<string, unknown>;

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
