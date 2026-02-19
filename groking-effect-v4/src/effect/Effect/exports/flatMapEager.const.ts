/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: flatMapEager
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.909Z
 *
 * Overview:
 * An optimized version of `flatMap` that checks if an effect is already resolved and applies the flatMap function eagerly when possible.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // For resolved effects, the flatMap is applied immediately
 * const resolved = Effect.succeed(5)
 * const flatMapped = Effect.flatMapEager(resolved, (n) => Effect.succeed(n * 2)) // Applied eagerly
 *
 * // For pending effects, behaves like regular flatMap
 * const pending = Effect.delay(Effect.succeed(5), "100 millis")
 * const flatMappedPending = Effect.flatMapEager(
 *   pending,
 *   (n) => Effect.succeed(n * 2)
 * ) // Uses regular flatMap
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
const exportName = "flatMapEager";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "An optimized version of `flatMap` that checks if an effect is already resolved and applies the flatMap function eagerly when possible.";
const sourceExample =
  'import { Effect } from "effect"\n\n// For resolved effects, the flatMap is applied immediately\nconst resolved = Effect.succeed(5)\nconst flatMapped = Effect.flatMapEager(resolved, (n) => Effect.succeed(n * 2)) // Applied eagerly\n\n// For pending effects, behaves like regular flatMap\nconst pending = Effect.delay(Effect.succeed(5), "100 millis")\nconst flatMappedPending = Effect.flatMapEager(\n  pending,\n  (n) => Effect.succeed(n * 2)\n) // Uses regular flatMap';
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
