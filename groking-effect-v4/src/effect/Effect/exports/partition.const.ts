/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: partition
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Applies an effectful function to each element and partitions failures and successes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.partition([0, 1, 2, 3], (n) =>
 *   n % 2 === 0 ? Effect.fail(`${n} is even`) : Effect.succeed(n)
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // [ ["0 is even", "2 is even"], [1, 3] ]
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
const exportName = "partition";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Applies an effectful function to each element and partitions failures and successes.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.partition([0, 1, 2, 3], (n) =>\n  n % 2 === 0 ? Effect.fail(`${n} is even`) : Effect.succeed(n)\n)\n\nEffect.runPromise(program).then(console.log)\n// [ ["0 is even", "2 is even"], [1, 3] ]';
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
