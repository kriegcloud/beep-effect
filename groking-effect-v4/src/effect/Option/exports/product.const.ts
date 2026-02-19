/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: product
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Combines two `Option`s into a `Some` containing a tuple `[A, B]` if both are `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.product(Option.some("hello"), Option.some(42)))
 * // Output: { _id: 'Option', _tag: 'Some', value: ['hello', 42] }
 *
 * console.log(Option.product(Option.none(), Option.some(42)))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "product";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Combines two `Option`s into a `Some` containing a tuple `[A, B]` if both are `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.product(Option.some(\"hello\"), Option.some(42)))\n// Output: { _id: 'Option', _tag: 'Some', value: ['hello', 42] }\n\nconsole.log(Option.product(Option.none(), Option.some(42)))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedPairs = Effect.gen(function* () {
  const bothPresent = O.product(O.some("hello"), O.some(42));
  const leftMissing = O.product(O.none<string>(), O.some(42));
  const rightMissing = O.product(O.some("hello"), O.none<number>());

  yield* Console.log(`some("hello") x some(42) -> ${formatUnknown(bothPresent)}`);
  yield* Console.log(`none() x some(42) -> ${formatUnknown(leftMissing)}`);
  yield* Console.log(`some("hello") x none() -> ${formatUnknown(rightMissing)}`);
});

const exampleComposeAfterProduct = Effect.gen(function* () {
  const activePlan = O.some("pro");
  const monthlyCents = O.some(1900);
  const missingPrice = O.none<number>();

  const billingLine = O.product(activePlan, monthlyCents).pipe(
    O.map(([plan, cents]) => `${plan}:$${(cents / 100).toFixed(2)}`)
  );

  const unavailableLine = O.product(activePlan, missingPrice).pipe(
    O.map(([plan, cents]) => `${plan}:$${(cents / 100).toFixed(2)}`)
  );

  yield* Console.log(`both values present -> ${formatUnknown(billingLine)}`);
  yield* Console.log(`price missing -> ${formatUnknown(unavailableLine)}`);
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
      title: "Source-Aligned Pairing",
      description: "Combine Some/None pairs to show when product yields Some tuple vs None.",
      run: exampleSourceAlignedPairs,
    },
    {
      title: "Compose After Product",
      description: "Map the tuple result into a billing label only when both inputs are present.",
      run: exampleComposeAfterProduct,
    },
  ],
});

BunRuntime.runMain(program);
