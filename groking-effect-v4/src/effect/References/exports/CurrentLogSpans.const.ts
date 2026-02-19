/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: CurrentLogSpans
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:14:16.489Z
 *
 * Overview:
 * Reference for managing log spans that track the duration and hierarchy of operations. Each span represents a labeled time period for performance analysis and debugging.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, References } from "effect"
 *
 * const logSpanExample = Effect.gen(function*() {
 *   // Get current spans (empty by default)
 *   const current = yield* References.CurrentLogSpans
 *   console.log(current.length) // 0
 *
 *   // Add a log span manually
 *   const startTime = Date.now()
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       // Simulate some work
 *       yield* Effect.sleep("100 millis")
 *       yield* Console.log("Database operation in progress")
 *
 *       const spans = yield* References.CurrentLogSpans
 *       console.log("Active spans:", spans.map(([label]) => label)) // ["database-connection"]
 *     }),
 *     References.CurrentLogSpans,
 *     [["database-connection", startTime]]
 *   )
 *
 *   // Add another span
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const spans = yield* References.CurrentLogSpans
 *       console.log("Active spans:", spans.map(([label]) => label)) // ["database-connection", "data-processing"]
 *
 *       yield* Console.log("Multiple operations in progress")
 *     }),
 *     References.CurrentLogSpans,
 *     [
 *       ["database-connection", startTime],
 *       ["data-processing", Date.now()]
 *     ]
 *   )
 *
 *   // Clear spans when operations complete
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const spans = yield* References.CurrentLogSpans
 *       console.log("Active spans:", spans.length) // 0
 *     }),
 *     References.CurrentLogSpans,
 *     []
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
const exportName = "CurrentLogSpans";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary =
  "Reference for managing log spans that track the duration and hierarchy of operations. Each span represents a labeled time period for performance analysis and debugging.";
const sourceExample =
  'import { Console, Effect, References } from "effect"\n\nconst logSpanExample = Effect.gen(function*() {\n  // Get current spans (empty by default)\n  const current = yield* References.CurrentLogSpans\n  console.log(current.length) // 0\n\n  // Add a log span manually\n  const startTime = Date.now()\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      // Simulate some work\n      yield* Effect.sleep("100 millis")\n      yield* Console.log("Database operation in progress")\n\n      const spans = yield* References.CurrentLogSpans\n      console.log("Active spans:", spans.map(([label]) => label)) // ["database-connection"]\n    }),\n    References.CurrentLogSpans,\n    [["database-connection", startTime]]\n  )\n\n  // Add another span\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const spans = yield* References.CurrentLogSpans\n      console.log("Active spans:", spans.map(([label]) => label)) // ["database-connection", "data-processing"]\n\n      yield* Console.log("Multiple operations in progress")\n    }),\n    References.CurrentLogSpans,\n    [\n      ["database-connection", startTime],\n      ["data-processing", Date.now()]\n    ]\n  )\n\n  // Clear spans when operations complete\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const spans = yield* References.CurrentLogSpans\n      console.log("Active spans:", spans.length) // 0\n    }),\n    References.CurrentLogSpans,\n    []\n  )\n})';
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
