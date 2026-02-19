/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: CurrentLogLevel
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:14:16.489Z
 *
 * Overview:
 * Reference for controlling the current log level for dynamic filtering.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, References } from "effect"
 * 
 * const dynamicLogging = Effect.gen(function*() {
 *   // Get current log level (default is "Info")
 *   const current = yield* References.CurrentLogLevel
 *   console.log(current) // "Info"
 * 
 *   // Set log level to Debug for detailed logging
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const level = yield* References.CurrentLogLevel
 *       console.log(level) // "Debug"
 *       yield* Console.debug("This debug message will be shown")
 *     }),
 *     References.CurrentLogLevel,
 *     "Debug"
 *   )
 * 
 *   // Change to Error level to reduce noise
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const level = yield* References.CurrentLogLevel
 *       console.log(level) // "Error"
 *       yield* Console.info("This info message will be filtered out")
 *       yield* Console.error("This error message will be shown")
 *     }),
 *     References.CurrentLogLevel,
 *     "Error"
 *   )
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
import * as ReferencesModule from "effect/References";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CurrentLogLevel";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary = "Reference for controlling the current log level for dynamic filtering.";
const sourceExample = "import { Console, Effect, References } from \"effect\"\n\nconst dynamicLogging = Effect.gen(function*() {\n  // Get current log level (default is \"Info\")\n  const current = yield* References.CurrentLogLevel\n  console.log(current) // \"Info\"\n\n  // Set log level to Debug for detailed logging\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const level = yield* References.CurrentLogLevel\n      console.log(level) // \"Debug\"\n      yield* Console.debug(\"This debug message will be shown\")\n    }),\n    References.CurrentLogLevel,\n    \"Debug\"\n  )\n\n  // Change to Error level to reduce noise\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const level = yield* References.CurrentLogLevel\n      console.log(level) // \"Error\"\n      yield* Console.info(\"This info message will be filtered out\")\n      yield* Console.error(\"This error message will be shown\")\n    }),\n    References.CurrentLogLevel,\n    \"Error\"\n  )\n})";
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
