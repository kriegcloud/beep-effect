/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: eventually
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.908Z
 *
 * Overview:
 * Retries an effect until it succeeds, discarding failures.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * let attempts = 0
 *
 * const flaky = Effect.gen(function*() {
 *   attempts++
 *   yield* Console.log(`Attempt ${attempts}`)
 *   if (attempts < 3) {
 *     yield* Effect.fail("Not ready")
 *   }
 *   return "Ready"
 * })
 *
 * const program = Effect.eventually(flaky)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Attempt 1
 * // Attempt 2
 * // Attempt 3
 * // Ready
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
const exportName = "eventually";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Retries an effect until it succeeds, discarding failures.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nlet attempts = 0\n\nconst flaky = Effect.gen(function*() {\n  attempts++\n  yield* Console.log(`Attempt ${attempts}`)\n  if (attempts < 3) {\n    yield* Effect.fail("Not ready")\n  }\n  return "Ready"\n})\n\nconst program = Effect.eventually(flaky)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Attempt 1\n// Attempt 2\n// Attempt 3\n// Ready';
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
