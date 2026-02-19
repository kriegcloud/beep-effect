/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Pipeable
 * Export: Pipeable
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Pipeable.ts
 * Generated: 2026-02-19T04:14:15.692Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * // The Pipeable interface allows Effect values to be chained using the pipe method
 * const program = Effect.succeed(1).pipe(
 *   Effect.map((x) => x + 1),
 *   Effect.flatMap((x) => Effect.succeed(x * 2)),
 *   Effect.tap((x) => Effect.log(`Result: ${x}`))
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
import * as PipeableModule from "effect/Pipeable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Pipeable";
const exportKind = "interface";
const moduleImportPath = "effect/Pipeable";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Effect } from \"effect\"\n\n// The Pipeable interface allows Effect values to be chained using the pipe method\nconst program = Effect.succeed(1).pipe(\n  Effect.map((x) => x + 1),\n  Effect.flatMap((x) => Effect.succeed(x * 2)),\n  Effect.tap((x) => Effect.log(`Result: ${x}`))\n)";
const moduleRecord = PipeableModule as Record<string, unknown>;

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
