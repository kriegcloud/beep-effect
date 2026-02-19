/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: fromNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * Converts a nullable value to an `Effect`, failing with a `NoSuchElementError` when the value is `null` or `undefined`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const input: string | null = null
 *
 * const program = Effect.gen(function*() {
 *   const value = yield* Effect.fromNullishOr(input)
 *   yield* Console.log(value)
 * }).pipe(
 *   Effect.catch(() => Console.log("missing"))
 * )
 *
 * Effect.runPromise(program)
 * // Output: missing
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
const exportName = "fromNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Converts a nullable value to an `Effect`, failing with a `NoSuchElementError` when the value is `null` or `undefined`.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst input: string | null = null\n\nconst program = Effect.gen(function*() {\n  const value = yield* Effect.fromNullishOr(input)\n  yield* Console.log(value)\n}).pipe(\n  Effect.catch(() => Console.log("missing"))\n)\n\nEffect.runPromise(program)\n// Output: missing';
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
