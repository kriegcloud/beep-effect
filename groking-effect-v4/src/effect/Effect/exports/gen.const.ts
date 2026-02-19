/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: gen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.910Z
 *
 * Overview:
 * Provides a way to write effectful code using generator functions, simplifying control flow and error handling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const addServiceCharge = (amount: number) => amount + 1
 *
 * const applyDiscount = (
 *   total: number,
 *   discountRate: number
 * ): Effect.Effect<number, Error> =>
 *   discountRate === 0
 *     ? Effect.fail(new Error("Discount rate cannot be zero"))
 *     : Effect.succeed(total - (total * discountRate) / 100)
 *
 * const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
 *
 * const fetchDiscountRate = Effect.promise(() => Promise.resolve(5))
 *
 * export const program = Effect.gen(function*() {
 *   const transactionAmount = yield* fetchTransactionAmount
 *   const discountRate = yield* fetchDiscountRate
 *   const discountedAmount = yield* applyDiscount(
 *     transactionAmount,
 *     discountRate
 *   )
 *   const finalAmount = addServiceCharge(discountedAmount)
 *   return `Final amount to charge: ${finalAmount}`
 * })
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
const exportName = "gen";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Provides a way to write effectful code using generator functions, simplifying control flow and error handling.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst addServiceCharge = (amount: number) => amount + 1\n\nconst applyDiscount = (\n  total: number,\n  discountRate: number\n): Effect.Effect<number, Error> =>\n  discountRate === 0\n    ? Effect.fail(new Error("Discount rate cannot be zero"))\n    : Effect.succeed(total - (total * discountRate) / 100)\n\nconst fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))\n\nconst fetchDiscountRate = Effect.promise(() => Promise.resolve(5))\n\nexport const program = Effect.gen(function*() {\n  const transactionAmount = yield* fetchTransactionAmount\n  const discountRate = yield* fetchDiscountRate\n  const discountedAmount = yield* applyDiscount(\n    transactionAmount,\n    discountRate\n  )\n  const finalAmount = addServiceCharge(discountedAmount)\n  return `Final amount to charge: ${finalAmount}`\n})';
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
