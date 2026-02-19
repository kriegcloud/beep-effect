/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: AnySpan
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:14:22.376Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Tracer } from "effect"
 * 
 * // Function that accepts any span type
 * const logSpan = (span: Tracer.AnySpan) => {
 *   console.log(`Span ID: ${span.spanId}, Trace ID: ${span.traceId}`)
 *   return Effect.succeed(span)
 * }
 * 
 * // Works with both Span and ExternalSpan
 * const externalSpan = Tracer.externalSpan({
 *   spanId: "span-123",
 *   traceId: "trace-456"
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TracerModule from "effect/Tracer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "AnySpan";
const exportKind = "type";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Effect, Tracer } from \"effect\"\n\n// Function that accepts any span type\nconst logSpan = (span: Tracer.AnySpan) => {\n  console.log(`Span ID: ${span.spanId}, Trace ID: ${span.traceId}`)\n  return Effect.succeed(span)\n}\n\n// Works with both Span and ExternalSpan\nconst externalSpan = Tracer.externalSpan({\n  spanId: \"span-123\",\n  traceId: \"trace-456\"\n})";
const moduleRecord = TracerModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
