/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: TracerSpanAnnotations
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:14:16.490Z
 *
 * Overview:
 * Reference for managing span annotations that are automatically added to all new spans. These annotations provide context and metadata that applies across multiple spans.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, References } from "effect"
 *
 * const spanAnnotationExample = Effect.gen(function*() {
 *   // Get current annotations (empty by default)
 *   const current = yield* References.TracerSpanAnnotations
 *   console.log(current) // {}
 *
 *   // Set global span annotations
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       // Get current annotations
 *       const annotations = yield* References.TracerSpanAnnotations
 *       console.log(annotations) // { service: "user-service", version: "1.2.3", environment: "production" }
 *
 *       // All spans created will include these annotations
 *       yield* Effect.gen(function*() {
 *         // Add more specific annotations for this span
 *         yield* Effect.annotateCurrentSpan("userId", "123")
 *         yield* Effect.log("Processing user")
 *       })
 *     }),
 *     References.TracerSpanAnnotations,
 *     {
 *       service: "user-service",
 *       version: "1.2.3",
 *       environment: "production"
 *     }
 *   )
 *
 *   // Clear annotations
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const annotations = yield* References.TracerSpanAnnotations
 *       console.log(annotations) // {}
 *     }),
 *     References.TracerSpanAnnotations,
 *     {}
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
const exportName = "TracerSpanAnnotations";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary =
  "Reference for managing span annotations that are automatically added to all new spans. These annotations provide context and metadata that applies across multiple spans.";
const sourceExample =
  'import { Effect, References } from "effect"\n\nconst spanAnnotationExample = Effect.gen(function*() {\n  // Get current annotations (empty by default)\n  const current = yield* References.TracerSpanAnnotations\n  console.log(current) // {}\n\n  // Set global span annotations\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      // Get current annotations\n      const annotations = yield* References.TracerSpanAnnotations\n      console.log(annotations) // { service: "user-service", version: "1.2.3", environment: "production" }\n\n      // All spans created will include these annotations\n      yield* Effect.gen(function*() {\n        // Add more specific annotations for this span\n        yield* Effect.annotateCurrentSpan("userId", "123")\n        yield* Effect.log("Processing user")\n      })\n    }),\n    References.TracerSpanAnnotations,\n    {\n      service: "user-service",\n      version: "1.2.3",\n      environment: "production"\n    }\n  )\n\n  // Clear annotations\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const annotations = yield* References.TracerSpanAnnotations\n      console.log(annotations) // {}\n    }),\n    References.TracerSpanAnnotations,\n    {}\n  )\n})';
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
