/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: filterOrFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.388Z
 *
 * Overview:
 * Filters an effect, failing with a custom error if the predicate fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // An effect that produces a number
 * const program = Effect.succeed(5)
 *
 * // Filter for even numbers, fail for odd numbers
 * const filtered = Effect.filterOrFail(
 *   program,
 *   (n) => n % 2 === 0,
 *   (n) => `Expected even number, got ${n}`
 * )
 *
 * // Result: Effect.fail("Expected even number, got 5")
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterOrFail";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Filters an effect, failing with a custom error if the predicate fails.";
const sourceExample =
  'import { Effect } from "effect"\n\n// An effect that produces a number\nconst program = Effect.succeed(5)\n\n// Filter for even numbers, fail for odd numbers\nconst filtered = Effect.filterOrFail(\n  program,\n  (n) => n % 2 === 0,\n  (n) => `Expected even number, got ${n}`\n)\n\n// Result: Effect.fail("Expected even number, got 5")';
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
  bunContext: BunContext,
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
