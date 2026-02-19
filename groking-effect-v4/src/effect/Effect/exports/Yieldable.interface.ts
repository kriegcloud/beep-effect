/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: Yieldable
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.397Z
 *
 * Overview:
 * A type that can be yielded in an Effect generator function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Effects implement Yieldable and can be used with yield*
 * const effect1 = Effect.succeed(10)
 * const effect2 = Effect.succeed(20)
 *
 * const program = Effect.gen(function*() {
 *   const a = yield* effect1 // yields the Effect which implements Yieldable
 *   const b = yield* effect2
 *   return a + b
 * })
 *
 * Effect.runPromise(program).then(console.log) // 30
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
const exportName = "Yieldable";
const exportKind = "interface";
const moduleImportPath = "effect/Effect";
const sourceSummary = "A type that can be yielded in an Effect generator function.";
const sourceExample =
  'import { Effect } from "effect"\n\n// Effects implement Yieldable and can be used with yield*\nconst effect1 = Effect.succeed(10)\nconst effect2 = Effect.succeed(20)\n\nconst program = Effect.gen(function*() {\n  const a = yield* effect1 // yields the Effect which implements Yieldable\n  const b = yield* effect2\n  return a + b\n})\n\nEffect.runPromise(program).then(console.log) // 30';
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
