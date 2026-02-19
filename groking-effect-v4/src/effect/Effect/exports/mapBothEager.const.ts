/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: mapBothEager
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * An optimized version of `mapBoth` that checks if an effect is already resolved and applies the appropriate mapping function eagerly when possible.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // For resolved effects, the appropriate mapping is applied immediately
 * const success = Effect.succeed(5)
 * const mapped = Effect.mapBothEager(success, {
 *   onFailure: (err: string) => `Failed: ${err}`,
 *   onSuccess: (n: number) => n * 2
 * }) // onSuccess applied eagerly
 *
 * const failure = Effect.fail("error")
 * const mappedError = Effect.mapBothEager(failure, {
 *   onFailure: (err: string) => `Failed: ${err}`,
 *   onSuccess: (n: number) => n * 2
 * }) // onFailure applied eagerly
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
const exportName = "mapBothEager";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "An optimized version of `mapBoth` that checks if an effect is already resolved and applies the appropriate mapping function eagerly when possible.";
const sourceExample =
  'import { Effect } from "effect"\n\n// For resolved effects, the appropriate mapping is applied immediately\nconst success = Effect.succeed(5)\nconst mapped = Effect.mapBothEager(success, {\n  onFailure: (err: string) => `Failed: ${err}`,\n  onSuccess: (n: number) => n * 2\n}) // onSuccess applied eagerly\n\nconst failure = Effect.fail("error")\nconst mappedError = Effect.mapBothEager(failure, {\n  onFailure: (err: string) => `Failed: ${err}`,\n  onSuccess: (n: number) => n * 2\n}) // onFailure applied eagerly';
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
