/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: fromYieldable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.910Z
 *
 * Overview:
 * Converts a yieldable value to an Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as Option from "effect/Option"
 *
 * // Option is yieldable in Effect
 * const program = Effect.gen(function*() {
 *   const value = yield* Effect.fromYieldable(Option.some(42))
 *   return value * 2
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: 84
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
const exportName = "fromYieldable";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Converts a yieldable value to an Effect.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as Option from "effect/Option"\n\n// Option is yieldable in Effect\nconst program = Effect.gen(function*() {\n  const value = yield* Effect.fromYieldable(Option.some(42))\n  return value * 2\n})\n\nEffect.runPromise(program).then(console.log)\n// Output: 84';
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
