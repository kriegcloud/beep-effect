/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: TracerSpanLinks
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/References.ts
 * Generated: 2026-02-19T04:50:38.765Z
 *
 * Overview:
 * Reference for managing span links that are automatically added to all new spans. Span links connect related spans that are not in a parent-child relationship.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, References, Tracer } from "effect"
 *
 * const spanLinksExample = Effect.gen(function*() {
 *   // Get current links (empty by default)
 *   const current = yield* References.TracerSpanLinks
 *   console.log(current.length) // 0
 *
 *   // Create an external span for the example
 *   const externalSpan = Tracer.externalSpan({
 *     spanId: "external-span-123",
 *     traceId: "trace-456"
 *   })
 *
 *   // Create span links
 *   const spanLink: Tracer.SpanLink = {
 *     span: externalSpan,
 *     attributes: {
 *       relationship: "follows-from",
 *       priority: "high"
 *     }
 *   }
 *
 *   // Set global span links
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       // Get current links
 *       const links = yield* References.TracerSpanLinks
 *       console.log(links.length) // 1
 *
 *       // All new spans will include these links
 *       yield* Effect.gen(function*() {
 *         yield* Effect.log("This span will have linked spans")
 *         return "operation complete"
 *       })
 *     }),
 *     References.TracerSpanLinks,
 *     [spanLink]
 *   )
 *
 *   // Clear links
 *   yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const links = yield* References.TracerSpanLinks
 *       console.log(links.length) // 0
 *     }),
 *     References.TracerSpanLinks,
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ReferencesModule from "effect/References";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TracerSpanLinks";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary =
  "Reference for managing span links that are automatically added to all new spans. Span links connect related spans that are not in a parent-child relationship.";
const sourceExample =
  'import { Effect, References, Tracer } from "effect"\n\nconst spanLinksExample = Effect.gen(function*() {\n  // Get current links (empty by default)\n  const current = yield* References.TracerSpanLinks\n  console.log(current.length) // 0\n\n  // Create an external span for the example\n  const externalSpan = Tracer.externalSpan({\n    spanId: "external-span-123",\n    traceId: "trace-456"\n  })\n\n  // Create span links\n  const spanLink: Tracer.SpanLink = {\n    span: externalSpan,\n    attributes: {\n      relationship: "follows-from",\n      priority: "high"\n    }\n  }\n\n  // Set global span links\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      // Get current links\n      const links = yield* References.TracerSpanLinks\n      console.log(links.length) // 1\n\n      // All new spans will include these links\n      yield* Effect.gen(function*() {\n        yield* Effect.log("This span will have linked spans")\n        return "operation complete"\n      })\n    }),\n    References.TracerSpanLinks,\n    [spanLink]\n  )\n\n  // Clear links\n  yield* Effect.provideService(\n    Effect.gen(function*() {\n      const links = yield* References.TracerSpanLinks\n      console.log(links.length) // 0\n    }),\n    References.TracerSpanLinks,\n    []\n  )\n})';
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
