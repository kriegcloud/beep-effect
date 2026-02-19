/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: SpanStatus
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:50:43.303Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Tracer } from "effect"
 * import { Exit } from "effect"
 *
 * // Started span status
 * const startedStatus: Tracer.SpanStatus = {
 *   _tag: "Started",
 *   startTime: BigInt(Date.now() * 1000000)
 * }
 *
 * // Ended span status
 * const endedStatus: Tracer.SpanStatus = {
 *   _tag: "Ended",
 *   startTime: BigInt(Date.now() * 1000000),
 *   endTime: BigInt(Date.now() * 1000000 + 1000000),
 *   exit: Exit.succeed("result")
 * }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TracerModule from "effect/Tracer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SpanStatus";
const exportKind = "type";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import type { Tracer } from "effect"\nimport { Exit } from "effect"\n\n// Started span status\nconst startedStatus: Tracer.SpanStatus = {\n  _tag: "Started",\n  startTime: BigInt(Date.now() * 1000000)\n}\n\n// Ended span status\nconst endedStatus: Tracer.SpanStatus = {\n  _tag: "Ended",\n  startTime: BigInt(Date.now() * 1000000),\n  endTime: BigInt(Date.now() * 1000000 + 1000000),\n  exit: Exit.succeed("result")\n}';
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
