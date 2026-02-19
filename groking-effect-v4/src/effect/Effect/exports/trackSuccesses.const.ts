/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: trackSuccesses
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Updates the provided `Metric` every time the wrapped `Effect` succeeds with a value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const successCounter = Metric.counter("successes").pipe(
 *   Metric.withConstantInput(1)
 * )
 *
 * const program = Effect.succeed(42).pipe(
 *   Effect.trackSuccesses(successCounter)
 * )
 *
 * Effect.runPromise(program).then(() =>
 *   Effect.runPromise(Metric.value(successCounter)).then(console.log)
 *   // Output: { count: 1, incremental: false }
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
const exportName = "trackSuccesses";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Updates the provided `Metric` every time the wrapped `Effect` succeeds with a value.";
const sourceExample =
  'import { Effect, Metric } from "effect"\n\nconst successCounter = Metric.counter("successes").pipe(\n  Metric.withConstantInput(1)\n)\n\nconst program = Effect.succeed(42).pipe(\n  Effect.trackSuccesses(successCounter)\n)\n\nEffect.runPromise(program).then(() =>\n  Effect.runPromise(Metric.value(successCounter)).then(console.log)\n  // Output: { count: 1, incremental: false }\n)';
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
