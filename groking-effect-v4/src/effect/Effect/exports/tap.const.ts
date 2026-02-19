/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.915Z
 *
 * Overview:
 * Runs a side effect with the result of an effect without changing the original value.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Logging a step in a pipeline
 * import { Effect, pipe } from "effect"
 * import { Console } from "effect"
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
 * const finalAmount = pipe(
 *   fetchTransactionAmount,
 *   // Log the fetched transaction amount
 *   Effect.tap((amount) => Console.log(`Apply a discount to: ${amount}`)),
 *   // `amount` is still available!
 *   Effect.flatMap((amount) => applyDiscount(amount, 5))
 * )
 *
 * Effect.runPromise(finalAmount).then(console.log)
 * // Output:
 * // Apply a discount to: 100
 * // 95
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
const exportName = "tap";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs a side effect with the result of an effect without changing the original value.";
const sourceExample =
  '// Title: Logging a step in a pipeline\nimport { Effect, pipe } from "effect"\nimport { Console } from "effect"\n\n// Function to apply a discount safely to a transaction amount\nconst applyDiscount = (\n  total: number,\n  discountRate: number\n): Effect.Effect<number, Error> =>\n  discountRate === 0\n    ? Effect.fail(new Error("Discount rate cannot be zero"))\n    : Effect.succeed(total - (total * discountRate) / 100)\n\n// Simulated asynchronous task to fetch a transaction amount from database\nconst fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))\n\nconst finalAmount = pipe(\n  fetchTransactionAmount,\n  // Log the fetched transaction amount\n  Effect.tap((amount) => Console.log(`Apply a discount to: ${amount}`)),\n  // `amount` is still available!\n  Effect.flatMap((amount) => applyDiscount(amount, 5))\n)\n\nEffect.runPromise(finalAmount).then(console.log)\n// Output:\n// Apply a discount to: 100\n// 95';
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
