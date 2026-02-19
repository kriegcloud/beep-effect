/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Creates an `Equivalence` for comparing two `Result` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Result } from "effect"
 *
 * const eq = Result.makeEquivalence(
 *   Equivalence.strictEqual<number>(),
 *   Equivalence.strictEqual<string>()
 * )
 *
 * console.log(eq(Result.succeed(1), Result.succeed(1)))
 * // Output: true
 *
 * console.log(eq(Result.succeed(1), Result.fail("x")))
 * // Output: false
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
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Creates an `Equivalence` for comparing two `Result` values.";
const sourceExample =
  'import { Equivalence, Result } from "effect"\n\nconst eq = Result.makeEquivalence(\n  Equivalence.strictEqual<number>(),\n  Equivalence.strictEqual<string>()\n)\n\nconsole.log(eq(Result.succeed(1), Result.succeed(1)))\n// Output: true\n\nconsole.log(eq(Result.succeed(1), Result.fail("x")))\n// Output: false';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeEquivalence as the Result equivalence constructor.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedEquivalence = Effect.gen(function* () {
  const eq = ResultModule.makeEquivalence(Equivalence.strictEqual<number>(), Equivalence.strictEqual<string>());

  yield* Console.log(`succeed(1) vs succeed(1) -> ${eq(ResultModule.succeed(1), ResultModule.succeed(1))}`);
  yield* Console.log(`succeed(1) vs succeed(2) -> ${eq(ResultModule.succeed(1), ResultModule.succeed(2))}`);
  yield* Console.log(`succeed(1) vs fail("x") -> ${eq(ResultModule.succeed(1), ResultModule.fail("x"))}`);
  yield* Console.log(`fail("x") vs fail("x") -> ${eq(ResultModule.fail("x"), ResultModule.fail("x"))}`);
});

const exampleCustomEquivalence = Effect.gen(function* () {
  const eqWithinOneOrNormalizedFailure = ResultModule.makeEquivalence<number, string>(
    (left, right) => Math.abs(left - right) <= 1,
    (left, right) => left.trim().toLowerCase() === right.trim().toLowerCase()
  );

  yield* Console.log(
    `succeed(41) vs succeed(42) with +/-1 rule -> ${eqWithinOneOrNormalizedFailure(
      ResultModule.succeed(41),
      ResultModule.succeed(42)
    )}`
  );
  yield* Console.log(
    `fail(" Timeout ") vs fail("timeout") normalized -> ${eqWithinOneOrNormalizedFailure(
      ResultModule.fail(" Timeout "),
      ResultModule.fail("timeout")
    )}`
  );
  yield* Console.log(
    `fail("timeout") vs fail("network") normalized -> ${eqWithinOneOrNormalizedFailure(
      ResultModule.fail("timeout"),
      ResultModule.fail("network")
    )}`
  );
  yield* Console.log(
    `cross-variant succeed/fail always false -> ${eqWithinOneOrNormalizedFailure(
      ResultModule.succeed(42),
      ResultModule.fail("42")
    )}`
  );
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
      description: "Mirror the JSDoc behavior with strict success and failure comparators.",
      run: exampleSourceAlignedEquivalence,
    },
    {
      title: "Custom Success/Failure Rules",
      description: "Use domain-specific rules for success values and failure values.",
      run: exampleCustomEquivalence,
    },
  ],
});

BunRuntime.runMain(program);
