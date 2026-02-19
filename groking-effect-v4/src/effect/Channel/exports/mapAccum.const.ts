/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: mapAccum
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.226Z
 *
 * Overview:
 * Statefully maps over a channel with an accumulator, where each element can produce multiple output values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4])
 *
 * // Use mapAccum to create running sums and emit both current and sum
 * const runningSum = Channel.mapAccum(
 *   numbersChannel,
 *   () => 0, // initial accumulator state
 *   (sum, current) => {
 *     const newSum = sum + current
 *     // Return [newState, outputValues]
 *     return [newSum, [current, newSum]] as const
 *   }
 * )
 * // Outputs: 1, 1, 2, 3, 3, 6, 4, 10
 *
 * // Using with Effect for async processing
 * const asyncMapAccum = Channel.mapAccum(
 *   numbersChannel,
 *   () => "",
 *   (acc, value) =>
 *     Effect.gen(function*() {
 *       const newAcc = acc + value.toString()
 *       return [newAcc, [`${value}-processed`, newAcc]] as const
 *     })
 * )
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapAccum";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Statefully maps over a channel with an accumulator, where each element can produce multiple output values.";
const sourceExample =
  'import { Channel, Effect } from "effect"\n\n// Create a channel with numbers\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4])\n\n// Use mapAccum to create running sums and emit both current and sum\nconst runningSum = Channel.mapAccum(\n  numbersChannel,\n  () => 0, // initial accumulator state\n  (sum, current) => {\n    const newSum = sum + current\n    // Return [newState, outputValues]\n    return [newSum, [current, newSum]] as const\n  }\n)\n// Outputs: 1, 1, 2, 3, 3, 6, 4, 10\n\n// Using with Effect for async processing\nconst asyncMapAccum = Channel.mapAccum(\n  numbersChannel,\n  () => "",\n  (acc, value) =>\n    Effect.gen(function*() {\n      const newAcc = acc + value.toString()\n      return [newAcc, [`${value}-processed`, newAcc]] as const\n    })\n)';
const moduleRecord = ChannelModule as Record<string, unknown>;

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
