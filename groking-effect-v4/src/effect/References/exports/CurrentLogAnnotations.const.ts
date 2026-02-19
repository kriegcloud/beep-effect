/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: CurrentLogAnnotations
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:50:38.764Z
 *
 * Overview:
 * Reference for managing log annotations that are automatically added to all log entries. These annotations provide contextual metadata that appears in every log message.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, References } from "effect"
 *
 * const logAnnotationExample = Effect.gen(function*() {
 *   // Get current annotations (empty by default)
 *   const current = yield* References.CurrentLogAnnotations
 *   console.log(current) // {}
 *
 *   // Run with custom log annotations
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const annotations = yield* References.CurrentLogAnnotations
 *       console.log(annotations) // { requestId: "req-123", userId: "user-456", version: "1.0.0" }
 *
 *       // All log entries will include these annotations
 *       yield* Console.log("Starting operation")
 *       yield* Console.info("Processing data")
 *     }),
 *     References.CurrentLogAnnotations,
 *     {
 *       requestId: "req-123",
 *       userId: "user-456",
 *       version: "1.0.0"
 *     }
 *   )
 *
 *   // Run with extended annotations
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const extended = yield* References.CurrentLogAnnotations
 *       console.log(extended) // { requestId: "req-123", userId: "user-456", version: "1.0.0", operation: "data-sync", timestamp: 1234567890 }
 *
 *       yield* Console.log("Operation completed with extended context")
 *     }),
 *     References.CurrentLogAnnotations,
 *     {
 *       requestId: "req-123",
 *       userId: "user-456",
 *       version: "1.0.0",
 *       operation: "data-sync",
 *       timestamp: 1234567890
 *     }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ReferencesModule from "effect/References";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CurrentLogAnnotations";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary =
  "Reference for managing log annotations that are automatically added to all log entries. These annotations provide contextual metadata that appears in every log message.";
const sourceExample =
  'import { Console, Effect, References } from "effect"\n\nconst logAnnotationExample = Effect.gen(function*() {\n  // Get current annotations (empty by default)\n  const current = yield* References.CurrentLogAnnotations\n  console.log(current) // {}\n\n  // Run with custom log annotations\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const annotations = yield* References.CurrentLogAnnotations\n      console.log(annotations) // { requestId: "req-123", userId: "user-456", version: "1.0.0" }\n\n      // All log entries will include these annotations\n      yield* Console.log("Starting operation")\n      yield* Console.info("Processing data")\n    }),\n    References.CurrentLogAnnotations,\n    {\n      requestId: "req-123",\n      userId: "user-456",\n      version: "1.0.0"\n    }\n  )\n\n  // Run with extended annotations\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const extended = yield* References.CurrentLogAnnotations\n      console.log(extended) // { requestId: "req-123", userId: "user-456", version: "1.0.0", operation: "data-sync", timestamp: 1234567890 }\n\n      yield* Console.log("Operation completed with extended context")\n    }),\n    References.CurrentLogAnnotations,\n    {\n      requestId: "req-123",\n      userId: "user-456",\n      version: "1.0.0",\n      operation: "data-sync",\n      timestamp: 1234567890\n    }\n  )\n})';
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
