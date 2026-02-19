/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: TracerEnabled
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:14:16.490Z
 *
 * Overview:
 * Reference for controlling whether tracing is enabled globally. When set to false, spans will not be registered with the tracer and tracing overhead is minimized.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, References } from "effect"
 * 
 * const tracingControl = Effect.gen(function*() {
 *   // Check if tracing is enabled (default is true)
 *   const current = yield* References.TracerEnabled
 *   console.log(current) // true
 * 
 *   // Disable tracing globally
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const isEnabled = yield* References.TracerEnabled
 *       console.log(isEnabled) // false
 * 
 *       // Spans will not be traced in this context
 *       yield* Effect.log("This will not be traced")
 *     }),
 *     References.TracerEnabled,
 *     false
 *   )
 * 
 *   // Re-enable tracing
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const isEnabled = yield* References.TracerEnabled
 *       console.log(isEnabled) // true
 * 
 *       // All subsequent spans will be traced
 *       yield* Effect.log("This will be traced")
 *     }),
 *     References.TracerEnabled,
 *     true
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
const exportName = "TracerEnabled";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary = "Reference for controlling whether tracing is enabled globally. When set to false, spans will not be registered with the tracer and tracing overhead is minimized.";
const sourceExample = "import { Effect, References } from \"effect\"\n\nconst tracingControl = Effect.gen(function*() {\n  // Check if tracing is enabled (default is true)\n  const current = yield* References.TracerEnabled\n  console.log(current) // true\n\n  // Disable tracing globally\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const isEnabled = yield* References.TracerEnabled\n      console.log(isEnabled) // false\n\n      // Spans will not be traced in this context\n      yield* Effect.log(\"This will not be traced\")\n    }),\n    References.TracerEnabled,\n    false\n  )\n\n  // Re-enable tracing\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const isEnabled = yield* References.TracerEnabled\n      console.log(isEnabled) // true\n\n      // All subsequent spans will be traced\n      yield* Effect.log(\"This will be traced\")\n    }),\n    References.TracerEnabled,\n    true\n  )\n})";
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
