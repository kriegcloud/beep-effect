/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * A {@link Cause} with an empty `reasons` array.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A {@link Cause} with an empty `reasons` array.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleEmptyShape = Effect.gen(function* () {
  const empty = CauseModule.empty;

  yield* Console.log(`isCause(empty): ${CauseModule.isCause(empty)}`);
  yield* Console.log(`empty.reasons.length: ${empty.reasons.length}`);
  yield* Console.log(`hasFails(empty): ${CauseModule.hasFails(empty)}`);
  yield* Console.log(`hasInterrupts(empty): ${CauseModule.hasInterrupts(empty)}`);
});

const exampleCombineIdentity = Effect.gen(function* () {
  const failCause = CauseModule.fail("boom");
  const interruptCause = CauseModule.interrupt();
  const withEmptyOnLeft = CauseModule.combine(CauseModule.empty, failCause);
  const withEmptyOnRight = CauseModule.combine(failCause, CauseModule.empty);
  const interruptWithEmpty = CauseModule.combine(CauseModule.empty, interruptCause);

  yield* Console.log(`combine(empty, fail) keeps reference: ${withEmptyOnLeft === failCause}`);
  yield* Console.log(`combine(fail, empty) keeps reference: ${withEmptyOnRight === failCause}`);
  yield* Console.log(`combine(empty, interrupt).reasons.length: ${interruptWithEmpty.reasons.length}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Empty Cause Shape",
      description: "Inspect the core invariants of `Cause.empty` as a data value.",
      run: exampleEmptyShape,
    },
    {
      title: "Identity In Cause.combine",
      description: "`Cause.empty` acts as a neutral element when combining causes.",
      run: exampleCombineIdentity,
    },
  ],
});

BunRuntime.runMain(program);
