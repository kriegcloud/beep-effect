/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeOrder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Creates an `Order` for `Option<A>` from an `Order` for `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * import * as N from "effect/Number"
 *
 * const ord = Option.makeOrder(N.Order)
 *
 * console.log(ord(Option.none(), Option.some(1)))
 * // Output: -1
 *
 * console.log(ord(Option.some(1), Option.none()))
 * // Output: 1
 *
 * console.log(ord(Option.some(1), Option.some(2)))
 * // Output: -1
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
import * as N from "effect/Number";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeOrder";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Creates an `Order` for `Option<A>` from an `Order` for `A`.";
const sourceExample =
  'import { Option } from "effect"\nimport * as N from "effect/Number"\n\nconst ord = Option.makeOrder(N.Order)\n\nconsole.log(ord(Option.none(), Option.some(1)))\n// Output: -1\n\nconsole.log(ord(Option.some(1), Option.none()))\n// Output: 1\n\nconsole.log(ord(Option.some(1), Option.some(2)))\n// Output: -1';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeOrder as the Option ordering constructor.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedOrdering = Effect.gen(function* () {
  const ord = O.makeOrder(N.Order);

  yield* Console.log(`none vs some(1) -> ${ord(O.none(), O.some(1))}`);
  yield* Console.log(`some(1) vs none -> ${ord(O.some(1), O.none())}`);
  yield* Console.log(`some(1) vs some(2) -> ${ord(O.some(1), O.some(2))}`);
  yield* Console.log(`none vs none -> ${ord(O.none(), O.none())}`);
});

const exampleSortOptionValues = Effect.gen(function* () {
  const ord = O.makeOrder(N.Order);
  const values = [O.some(3), O.none<number>(), O.some(1), O.some(2), O.none<number>()];
  const sorted = [...values].sort(ord);
  const labels = sorted.map((value) =>
    O.match(value, {
      onNone: () => "none",
      onSome: (n) => `some(${n})`,
    })
  );

  yield* Console.log(`sorted -> [${labels.join(", ")}]`);
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
      title: "Source-Aligned Ordering",
      description: "Mirror the JSDoc comparisons for none/some and some/some pairs.",
      run: exampleSourceAlignedOrdering,
    },
    {
      title: "Sorting Option Values",
      description: "Use the generated order to sort Options, keeping none values first.",
      run: exampleSortOptionValues,
    },
  ],
});

BunRuntime.runMain(program);
