/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: SpanLink
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:14:22.377Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Tracer } from "effect"
 * 
 * // Create a span link to connect spans
 * const externalSpan = Tracer.externalSpan({
 *   spanId: "external-span-123",
 *   traceId: "trace-456"
 * })
 * 
 * const link: Tracer.SpanLink = {
 *   span: externalSpan,
 *   attributes: { "link.type": "follows-from", "service": "external-api" }
 * }
 * 
 * const program = Effect.succeed("result").pipe(
 *   Effect.withSpan("linked-operation", { links: [link] })
 * )
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
const exportName = "SpanLink";
const exportKind = "interface";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Effect, Tracer } from \"effect\"\n\n// Create a span link to connect spans\nconst externalSpan = Tracer.externalSpan({\n  spanId: \"external-span-123\",\n  traceId: \"trace-456\"\n})\n\nconst link: Tracer.SpanLink = {\n  span: externalSpan,\n  attributes: { \"link.type\": \"follows-from\", \"service\": \"external-api\" }\n}\n\nconst program = Effect.succeed(\"result\").pipe(\n  Effect.withSpan(\"linked-operation\", { links: [link] })\n)";
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
