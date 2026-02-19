/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: ParentSpan
 * Kind: class
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
 * // Access the parent span from the context
 * const program = Effect.gen(function*() {
 *   const parentSpan = yield* Effect.service(Tracer.ParentSpan)
 *   console.log(`Parent span: ${parentSpan.spanId}`)
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TracerModule from "effect/Tracer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ParentSpan";
const exportKind = "class";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Effect, Tracer } from \"effect\"\n\n// Access the parent span from the context\nconst program = Effect.gen(function*() {\n  const parentSpan = yield* Effect.service(Tracer.ParentSpan)\n  console.log(`Parent span: ${parentSpan.spanId}`)\n})";
const moduleRecord = TracerModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
