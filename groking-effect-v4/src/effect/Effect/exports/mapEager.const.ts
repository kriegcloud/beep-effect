/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: mapEager
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.911Z
 *
 * Overview:
 * An optimized version of `map` that checks if an effect is already resolved and applies the mapping function eagerly when possible.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // For resolved effects, the mapping is applied immediately
 * const resolved = Effect.succeed(5)
 * const mapped = Effect.mapEager(resolved, (n) => n * 2) // Applied eagerly
 *
 * // For pending effects, behaves like regular map
 * const pending = Effect.delay(Effect.succeed(5), "100 millis")
 * const mappedPending = Effect.mapEager(pending, (n) => n * 2) // Uses regular map
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
const exportName = "mapEager";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "An optimized version of `map` that checks if an effect is already resolved and applies the mapping function eagerly when possible.";
const sourceExample =
  'import { Effect } from "effect"\n\n// For resolved effects, the mapping is applied immediately\nconst resolved = Effect.succeed(5)\nconst mapped = Effect.mapEager(resolved, (n) => n * 2) // Applied eagerly\n\n// For pending effects, behaves like regular map\nconst pending = Effect.delay(Effect.succeed(5), "100 millis")\nconst mappedPending = Effect.mapEager(pending, (n) => n * 2) // Uses regular map';
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
