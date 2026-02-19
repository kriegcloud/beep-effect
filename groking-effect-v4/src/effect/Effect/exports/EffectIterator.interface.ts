/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: EffectIterator
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * Iterator interface for Effect generators, enabling Effect values to work with generator functions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Effects are iterable and work with generator functions
 * const program = Effect.gen(function*() {
 *   const effect: Effect.Effect<number, never, never> = Effect.succeed(42)
 *
 *   // The effect's iterator is used internally by yield*
 *   const result = yield* effect
 *   return result * 2
 * })
 *
 * Effect.runPromise(program).then(console.log) // 84
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
const exportName = "EffectIterator";
const exportKind = "interface";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Iterator interface for Effect generators, enabling Effect values to work with generator functions.";
const sourceExample =
  'import { Effect } from "effect"\n\n// Effects are iterable and work with generator functions\nconst program = Effect.gen(function*() {\n  const effect: Effect.Effect<number, never, never> = Effect.succeed(42)\n\n  // The effect\'s iterator is used internally by yield*\n  const result = yield* effect\n  return result * 2\n})\n\nEffect.runPromise(program).then(console.log) // 84';
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
