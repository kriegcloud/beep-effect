/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: YieldableError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.198Z
 *
 * Overview:
 * Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect } from "effect"
 *
 * const error = new Cause.NoSuchElementError("not found")
 *
 * const program = Effect.gen(function*() {
 *   yield* error // fails the effect with NoSuchElementError
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "YieldableError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`.";
const sourceExample =
  'import { Cause, Effect } from "effect"\n\nconst error = new Cause.NoSuchElementError("not found")\n\nconst program = Effect.gen(function*() {\n  yield* error // fails the effect with NoSuchElementError\n})';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeErasureAndCompanionContext = Effect.gen(function* () {
  yield* Console.log(
    "Bridge note: `Cause.YieldableError` is a compile-time interface paired with runtime error constructors."
  );
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
  yield* Console.log("Inspecting runtime companion constructor: Cause.NoSuchElementError.");
  yield* inspectNamedExport({ moduleRecord, exportName: "NoSuchElementError" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  const error = new CauseModule.NoSuchElementError("not found");
  const hasIterator = typeof (error as { [Symbol.iterator]?: unknown })[Symbol.iterator] === "function";

  const yieldedFailure = yield* Effect.flip(
    Effect.gen(function* () {
      yield* error;
    })
  );

  const asEffectFailure = yield* Effect.flip(error.asEffect());

  yield* Console.log(`Error has Symbol.iterator: ${hasIterator}`);
  yield* Console.log(`yield* error failed with: ${yieldedFailure._tag} (${yieldedFailure.message})`);
  yield* Console.log(`error.asEffect() failed with: ${asEffectFailure._tag} (${asEffectFailure.message})`);
  yield* Console.log(`Cause.isNoSuchElementError(yieldedFailure): ${CauseModule.isNoSuchElementError(yieldedFailure)}`);
  yield* Console.log(`Both paths fail with same tag: ${yieldedFailure._tag === asEffectFailure._tag}`);
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
      title: "Type Erasure + Constructor Context",
      description: "Show interface erasure and inspect the runtime constructor companion export.",
      run: exampleTypeErasureAndCompanionContext,
    },
    {
      title: "Source-Aligned Companion Flow",
      description:
        "Construct `Cause.NoSuchElementError` and compare `yield* error` with `error.asEffect()` failure behavior.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
