/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: andThen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * Chains two actions, where the second action can depend on the result of the first.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, pipe } from "effect"
 *
 * // Function to apply a discount safely to a transaction amount
 * const applyDiscount = (
 *   total: number,
 *   discountRate: number
 * ): Effect.Effect<number, Error> =>
 *   discountRate === 0
 *     ? Effect.fail(new Error("Discount rate cannot be zero"))
 *     : Effect.succeed(total - (total * discountRate) / 100)
 *
 * // Simulated asynchronous task to fetch a transaction amount from database
 * const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
 *
 * // Using Effect.map and Effect.flatMap
 * const result1 = pipe(
 *   fetchTransactionAmount,
 *   Effect.map((amount) => amount * 2),
 *   Effect.flatMap((amount) => applyDiscount(amount, 5))
 * )
 *
 * Effect.runPromise(result1).then(console.log)
 * // Output: 190
 *
 * // Using Effect.andThen
 * const result2 = pipe(
 *   fetchTransactionAmount,
 *   Effect.andThen((amount) => Effect.succeed(amount * 2)),
 *   Effect.andThen((amount) => applyDiscount(amount, 5))
 * )
 *
 * Effect.runPromise(result2).then(console.log)
 * // Output: 190
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andThen";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Chains two actions, where the second action can depend on the result of the first.";
const sourceExample =
  'import { Effect, pipe } from "effect"\n\n// Function to apply a discount safely to a transaction amount\nconst applyDiscount = (\n  total: number,\n  discountRate: number\n): Effect.Effect<number, Error> =>\n  discountRate === 0\n    ? Effect.fail(new Error("Discount rate cannot be zero"))\n    : Effect.succeed(total - (total * discountRate) / 100)\n\n// Simulated asynchronous task to fetch a transaction amount from database\nconst fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))\n\n// Using Effect.map and Effect.flatMap\nconst result1 = pipe(\n  fetchTransactionAmount,\n  Effect.map((amount) => amount * 2),\n  Effect.flatMap((amount) => applyDiscount(amount, 5))\n)\n\nEffect.runPromise(result1).then(console.log)\n// Output: 190\n\n// Using Effect.andThen\nconst result2 = pipe(\n  fetchTransactionAmount,\n  Effect.andThen((amount) => Effect.succeed(amount * 2)),\n  Effect.andThen((amount) => applyDiscount(amount, 5))\n)\n\nEffect.runPromise(result2).then(console.log)\n// Output: 190';
const moduleRecord = EffectModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
