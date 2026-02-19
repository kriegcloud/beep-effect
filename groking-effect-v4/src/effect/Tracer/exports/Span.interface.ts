/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: Span
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:14:22.377Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Working with spans using withSpan
 * const program = Effect.succeed("Hello World").pipe(
 *   Effect.withSpan("my-operation")
 * )
 *
 * // The span interface defines the properties available
 * // when working with tracing in your effects
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TracerModule from "effect/Tracer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Span";
const exportKind = "interface";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect } from "effect"\n\n// Working with spans using withSpan\nconst program = Effect.succeed("Hello World").pipe(\n  Effect.withSpan("my-operation")\n)\n\n// The span interface defines the properties available\n// when working with tracing in your effects';
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
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
