/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: interruptors
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Collects the fiber IDs of all {@link Interrupt} reasons in the cause into a `ReadonlySet`. Returns an empty set when the cause has no interrupts.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.combine(
 *   Cause.interrupt(1),
 *   Cause.interrupt(2)
 * )
 * console.log(Cause.interruptors(cause)) // Set { 1, 2 }
 * ```
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
const exportName = "interruptors";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Collects the fiber IDs of all {@link Interrupt} reasons in the cause into a `ReadonlySet`. Returns an empty set when the cause has no interrupts.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.combine(\n  Cause.interrupt(1),\n  Cause.interrupt(2)\n)\nconsole.log(Cause.interruptors(cause)) // Set { 1, 2 }';

const formatInterruptors = (interruptors: ReadonlySet<unknown>): string =>
  `[${Array.from(interruptors, (fiberId) => String(fiberId)).join(", ")}]`;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeShape = Effect.gen(function* () {
  yield* Console.log(`typeof Cause.interruptors: ${typeof CauseModule.interruptors}`);
  yield* Console.log(`Cause.interruptors arity: ${CauseModule.interruptors.length} (expects a Cause input)`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const cause = CauseModule.combine(CauseModule.interrupt(1), CauseModule.interrupt(2));
  const ids = CauseModule.interruptors(cause);

  yield* Console.log(`interruptors(interrupt(1) + interrupt(2)) -> ${formatInterruptors(ids)}`);
});

const exampleNoInterrupts = Effect.gen(function* () {
  const noInterruptCause = CauseModule.combine(CauseModule.fail("boom"), CauseModule.die("defect"));
  const ids = CauseModule.interruptors(noInterruptCause);

  yield* Console.log(`interruptors(fail + die) size -> ${ids.size}`);
  yield* Console.log(`interruptors(fail + die) values -> ${formatInterruptors(ids)}`);
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
      title: "Runtime Shape",
      description: "Confirm interruptors is a callable value that expects a Cause argument.",
      run: exampleRuntimeShape,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Collect interrupting fiber IDs from a combined cause with two interrupts.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "No Interrupts Returns Empty Set",
      description: "A cause with only fail/die reasons produces an empty ReadonlySet.",
      run: exampleNoInterrupts,
    },
  ],
});

BunRuntime.runMain(program);
