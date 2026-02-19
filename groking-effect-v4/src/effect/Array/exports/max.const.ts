/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: max
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Returns the maximum element of a non-empty array according to the given `Order`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.max([3, 1, 2], Order.Number)) // 3
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Order from "effect/Order";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "max";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the maximum element of a non-empty array according to the given `Order`.";
const sourceExample = 'import { Array, Order } from "effect"\n\nconsole.log(Array.max([3, 1, 2], Order.Number)) // 3';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedMaximum = Effect.gen(function* () {
  const highest = A.max([3, 1, 2] as const, Order.Number);
  const highestNegative = A.max([-8, -3, -5] as const, Order.Number);

  yield* Console.log(`Array.max([3, 1, 2], Order.Number) => ${highest}`);
  yield* Console.log(`Array.max([-8, -3, -5], Order.Number) => ${highestNegative}`);
});

const exampleCurriedMaximum = Effect.gen(function* () {
  const maxNumber = A.max(Order.Number);
  const peakQ1 = maxNumber([12, 19, 7] as const);
  const peakQ2 = maxNumber([6, 6, 6] as const);

  yield* Console.log(`Array.max(Order.Number)([12, 19, 7]) => ${peakQ1}`);
  yield* Console.log(`Array.max(Order.Number)([6, 6, 6]) => ${peakQ2}`);
});

const exampleMappedOrderMaximum = Effect.gen(function* () {
  const servers = [
    { name: "edge-a", latencyMs: 42 },
    { name: "edge-b", latencyMs: 71 },
    { name: "edge-c", latencyMs: 55 },
  ] as const;

  const byLatency = Order.mapInput(Order.Number, (server: (typeof servers)[number]) => server.latencyMs);
  const slowest = A.max(servers, byLatency);

  yield* Console.log(`slowest server by latency => ${slowest.name} (${slowest.latencyMs}ms)`);
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
      title: "Source-Aligned Numeric Maximum",
      description: "Mirror the JSDoc call shape with number ordering, including negative values.",
      run: exampleSourceAlignedMaximum,
    },
    {
      title: "Curried Maximum",
      description: "Use the curried form to reuse a number max function across non-empty inputs.",
      run: exampleCurriedMaximum,
    },
    {
      title: "Mapped-Order Maximum",
      description: "Find the element with the highest derived metric using Order.mapInput.",
      run: exampleMappedOrderMaximum,
    },
  ],
});

BunRuntime.runMain(program);
