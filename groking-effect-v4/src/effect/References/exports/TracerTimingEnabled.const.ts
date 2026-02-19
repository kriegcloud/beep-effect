/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: TracerTimingEnabled
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:14:16.490Z
 *
 * Overview:
 * Reference for controlling whether trace timing is enabled globally. When set to false, spans will not contain timing information (trace time will always be set to zero).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, References } from "effect"
 *
 * const tracingControl = Effect.gen(function*() {
 *   // Check if trace timing is enabled (default is true)
 *   const current = yield* References.TracerTimingEnabled
 *   console.log(current) // true
 *
 *   // Disable trace timing globally
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       // Spans will not having timing information in this context
 *       const isEnabled = yield* References.TracerTimingEnabled
 *       console.log(isEnabled) // false
 *     }),
 *     References.TracerTimingEnabled,
 *     false
 *   )
 *
 *   // Re-enable trace timing
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       // Spans will have timing information in this context
 *       const isEnabled = yield* References.TracerTimingEnabled
 *       console.log(isEnabled) // true
 *     }),
 *     References.TracerTimingEnabled,
 *     true
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
const exportName = "TracerTimingEnabled";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary =
  "Reference for controlling whether trace timing is enabled globally. When set to false, spans will not contain timing information (trace time will always be set to zero).";
const sourceExample =
  'import { Effect, References } from "effect"\n\nconst tracingControl = Effect.gen(function*() {\n  // Check if trace timing is enabled (default is true)\n  const current = yield* References.TracerTimingEnabled\n  console.log(current) // true\n\n  // Disable trace timing globally\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      // Spans will not having timing information in this context\n      const isEnabled = yield* References.TracerTimingEnabled\n      console.log(isEnabled) // false\n    }),\n    References.TracerTimingEnabled,\n    false\n  )\n\n  // Re-enable trace timing\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      // Spans will have timing information in this context\n      const isEnabled = yield* References.TracerTimingEnabled\n      console.log(isEnabled) // true\n    }),\n    References.TracerTimingEnabled,\n    true\n  )\n})';
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
