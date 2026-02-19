/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: composeK
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Composes two `Option`-returning functions into a single function that chains them together.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const parse = (s: string): Option.Option<number> =>
 *   isNaN(Number(s)) ? Option.none() : Option.some(Number(s))
 *
 * const double = (n: number): Option.Option<number> =>
 *   n > 0 ? Option.some(n * 2) : Option.none()
 *
 * const parseAndDouble = Option.composeK(parse, double)
 *
 * console.log(parseAndDouble("42"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 84 }
 *
 * console.log(parseAndDouble("not a number"))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "composeK";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Composes two `Option`-returning functions into a single function that chains them together.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst parse = (s: string): Option.Option<number> =>\n  isNaN(Number(s)) ? Option.none() : Option.some(Number(s))\n\nconst double = (n: number): Option.Option<number> =>\n  n > 0 ? Option.some(n * 2) : Option.none()\n\nconst parseAndDouble = Option.composeK(parse, double)\n\nconsole.log(parseAndDouble(\"42\"))\n// Output: { _id: 'Option', _tag: 'Some', value: 84 }\n\nconsole.log(parseAndDouble(\"not a number\"))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect composeK runtime shape before running semantic examples.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedComposition = Effect.gen(function* () {
  const parse = (s: string): O.Option<number> => {
    const parsed = Number(s);
    return Number.isNaN(parsed) ? O.none() : O.some(parsed);
  };
  const doublePositive = (n: number): O.Option<number> => (n > 0 ? O.some(n * 2) : O.none());
  const parseAndDouble = O.composeK(parse, doublePositive);

  const validInput = parseAndDouble("42");
  const invalidNumber = parseAndDouble("not a number");
  const nonPositive = parseAndDouble("-3");

  yield* Console.log(`parseAndDouble("42") -> ${formatUnknown(validInput)}`);
  yield* Console.log(`parseAndDouble("not a number") -> ${formatUnknown(invalidNumber)}`);
  yield* Console.log(`parseAndDouble("-3") -> ${formatUnknown(nonPositive)}`);
});

const exampleCurriedCompositionAndShortCircuit = Effect.gen(function* () {
  const parseEven = (s: string): O.Option<number> => {
    const parsed = Number(s);
    return Number.isInteger(parsed) && parsed % 2 === 0 ? O.some(parsed) : O.none();
  };

  let reciprocalCalls = 0;
  const reciprocal = (n: number): O.Option<number> => {
    reciprocalCalls += 1;
    return n === 0 ? O.none() : O.some(1 / n);
  };

  const parseEvenThenReciprocal = O.composeK(reciprocal)(parseEven);
  const oddInput = parseEvenThenReciprocal("3");
  const callsAfterOdd = reciprocalCalls;
  const evenInput = parseEvenThenReciprocal("4");
  const zeroInput = parseEvenThenReciprocal("0");

  yield* Console.log(`composeK(reciprocal)(parseEven)("3") -> ${formatUnknown(oddInput)}`);
  yield* Console.log(`reciprocal calls after odd input: ${callsAfterOdd} (short-circuited)`);
  yield* Console.log(`composeK(reciprocal)(parseEven)("4") -> ${formatUnknown(evenInput)}`);
  yield* Console.log(`composeK(reciprocal)(parseEven)("0") -> ${formatUnknown(zeroInput)}`);
  yield* Console.log(`total reciprocal calls after all inputs: ${reciprocalCalls}`);
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
      title: "Source-Aligned Parse Then Double",
      description: "Compose parse and positive-doubling functions and observe success and short-circuit cases.",
      run: exampleSourceAlignedComposition,
    },
    {
      title: "Curried Form + Short-Circuit Behavior",
      description: "Use curried composeK and verify the second function only runs when the first returns Some.",
      run: exampleCurriedCompositionAndShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
