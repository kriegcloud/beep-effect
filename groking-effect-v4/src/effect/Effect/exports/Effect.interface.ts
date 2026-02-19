/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: Effect
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * The `Effect` interface defines a value that lazily describes a workflow or job. The workflow requires some context `R`, and may fail with an error of type `E`, or succeed with a value of type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // A simple effect that succeeds with a value
 * const success = Effect.succeed(42)
 *
 * // An effect that may fail
 * const risky = Effect.fail(new Error("Something went wrong"))
 *
 * // Effects can be composed using generator functions
 * const program = Effect.gen(function*() {
 *   const value = yield* success
 *   console.log(value) // 42
 *   return value * 2
 * })
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Effect";
const exportKind = "interface";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "The `Effect` interface defines a value that lazily describes a workflow or job. The workflow requires some context `R`, and may fail with an error of type `E`, or succeed with a...";
const sourceExample =
  'import { Effect } from "effect"\n\n// A simple effect that succeeds with a value\nconst success = Effect.succeed(42)\n\n// An effect that may fail\nconst risky = Effect.fail(new Error("Something went wrong"))\n\n// Effects can be composed using generator functions\nconst program = Effect.gen(function*() {\n  const value = yield* success\n  console.log(value) // 42\n  return value * 2\n})';
const moduleRecord = EffectModule as Record<string, unknown>;

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
