/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.388Z
 *
 * Overview:
 * Filters elements of an iterable using a predicate, refinement, effectful predicate, or `Filter.FilterEffect`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Filter, Result } from "effect"
 *
 * // Sync predicate
 * const evens = Effect.filter([1, 2, 3, 4], (n) => n % 2 === 0)
 *
 * // Effectful predicate
 * const checked = Effect.filter([1, 2, 3], (n) => Effect.succeed(n > 1))
 *
 * // FilterEffect
 * const mapped = Effect.filter([1, 2, 3, 4], (n) =>
 *   Effect.succeed(n % 2 === 0 ? Result.succeed(n * 2) : Result.fail(n))
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Filters elements of an iterable using a predicate, refinement, effectful predicate, or `Filter.FilterEffect`.";
const sourceExample =
  'import { Effect, Filter, Result } from "effect"\n\n// Sync predicate\nconst evens = Effect.filter([1, 2, 3, 4], (n) => n % 2 === 0)\n\n// Effectful predicate\nconst checked = Effect.filter([1, 2, 3], (n) => Effect.succeed(n > 1))\n\n// FilterEffect\nconst mapped = Effect.filter([1, 2, 3, 4], (n) =>\n  Effect.succeed(n % 2 === 0 ? Result.succeed(n * 2) : Result.fail(n))\n)';
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
