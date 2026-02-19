/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Creates an `Equivalence` for `Option<A>` from an `Equivalence` for `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Option } from "effect"
 *
 * const eq = Option.makeEquivalence(Equivalence.strictEqual<number>())
 *
 * console.log(eq(Option.some(1), Option.some(1)))
 * // Output: true
 *
 * console.log(eq(Option.some(1), Option.some(2)))
 * // Output: false
 *
 * console.log(eq(Option.none(), Option.none()))
 * // Output: true
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Equivalence from "effect/Equivalence";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Creates an `Equivalence` for `Option<A>` from an `Equivalence` for `A`.";
const sourceExample =
  'import { Equivalence, Option } from "effect"\n\nconst eq = Option.makeEquivalence(Equivalence.strictEqual<number>())\n\nconsole.log(eq(Option.some(1), Option.some(1)))\n// Output: true\n\nconsole.log(eq(Option.some(1), Option.some(2)))\n// Output: false\n\nconsole.log(eq(Option.none(), Option.none()))\n// Output: true';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeEquivalence as the Option equivalence constructor.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedEquivalence = Effect.gen(function* () {
  const eq = O.makeEquivalence(Equivalence.strictEqual<number>());

  yield* Console.log(`some(1) vs some(1) -> ${eq(O.some(1), O.some(1))}`);
  yield* Console.log(`some(1) vs some(2) -> ${eq(O.some(1), O.some(2))}`);
  yield* Console.log(`none vs none -> ${eq(O.none(), O.none())}`);
  yield* Console.log(`some(1) vs none -> ${eq(O.some(1), O.none())}`);
});

const exampleCustomNumberRule = Effect.gen(function* () {
  const eqWithinOne = O.makeEquivalence<number>((left, right) => Math.abs(left - right) <= 1);

  yield* Console.log(`some(10) vs some(11) (+/-1) -> ${eqWithinOne(O.some(10), O.some(11))}`);
  yield* Console.log(`some(10) vs some(13) (+/-1) -> ${eqWithinOne(O.some(10), O.some(13))}`);
  yield* Console.log(`none vs none (+/-1) -> ${eqWithinOne(O.none(), O.none())}`);
  yield* Console.log(`none vs some(10) (+/-1) -> ${eqWithinOne(O.none(), O.some(10))}`);
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Strict Equivalence",
      description: "Mirror the JSDoc comparisons for some/some and none/none values.",
      run: exampleSourceAlignedEquivalence,
    },
    {
      title: "Custom Numeric Equivalence",
      description: "Treat some values within +/-1 as equivalent while preserving Option shape checks.",
      run: exampleCustomNumberRule,
    },
  ],
});

BunRuntime.runMain(program);
