/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: SpanKind
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:14:22.377Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Tracer } from "effect"
 * import { Effect } from "effect"
 * 
 * // Different span kinds for different operations
 * const serverSpan = Effect.withSpan("handle-request", {
 *   kind: "server" as Tracer.SpanKind
 * })
 * 
 * const clientSpan = Effect.withSpan("api-call", {
 *   kind: "client" as Tracer.SpanKind
 * })
 * 
 * const internalSpan = Effect.withSpan("internal-process", {
 *   kind: "internal" as Tracer.SpanKind
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
const exportName = "SpanKind";
const exportKind = "type";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import type { Tracer } from \"effect\"\nimport { Effect } from \"effect\"\n\n// Different span kinds for different operations\nconst serverSpan = Effect.withSpan(\"handle-request\", {\n  kind: \"server\" as Tracer.SpanKind\n})\n\nconst clientSpan = Effect.withSpan(\"api-call\", {\n  kind: \"client\" as Tracer.SpanKind\n})\n\nconst internalSpan = Effect.withSpan(\"internal-process\", {\n  kind: \"internal\" as Tracer.SpanKind\n})";
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
