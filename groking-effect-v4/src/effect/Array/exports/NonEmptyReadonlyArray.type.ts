/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: NonEmptyReadonlyArray
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.705Z
 *
 * Overview:
 * A readonly array guaranteed to have at least one element.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Array } from "effect"
 * 
 * const nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3]
 * const head: number = nonEmpty[0] // guaranteed to exist
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
import * as ArrayModule from "effect/Array";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "NonEmptyReadonlyArray";
const exportKind = "type";
const moduleImportPath = "effect/Array";
const sourceSummary = "A readonly array guaranteed to have at least one element.";
const sourceExample = "import type { Array } from \"effect\"\n\nconst nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3]\nconst head: number = nonEmpty[0] // guaranteed to exist";
const moduleRecord = ArrayModule as Record<string, unknown>;

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
