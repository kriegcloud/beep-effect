/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: StreamTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.444Z
 *
 * Overview:
 * Type lambda for Stream used in higher-kinded type operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Kind } from "effect/HKT"
 * import type { StreamTypeLambda } from "effect/Stream"
 *
 * // Create a Stream type using the type lambda
 * type NumberStream = Kind<StreamTypeLambda, never, string, never, number>
 * // Equivalent to: Stream<number, string, never>
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "StreamTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Type lambda for Stream used in higher-kinded type operations.";
const sourceExample =
  'import type { Kind } from "effect/HKT"\nimport type { StreamTypeLambda } from "effect/Stream"\n\n// Create a Stream type using the type lambda\ntype NumberStream = Kind<StreamTypeLambda, never, string, never, number>\n// Equivalent to: Stream<number, string, never>';
const moduleRecord = StreamModule as Record<string, unknown>;

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
