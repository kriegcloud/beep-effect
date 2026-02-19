/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: asSome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * This function maps the success value of an `Effect` value to a `Some` value in an `Option` value. If the original `Effect` value fails, the returned `Effect` value will also fail.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.asSome(Effect.succeed(42))
 *
 * Effect.runPromise(program).then(console.log)
 * // { _id: 'Option', _tag: 'Some', value: 42 }
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
const exportName = "asSome";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "This function maps the success value of an `Effect` value to a `Some` value in an `Option` value. If the original `Effect` value fails, the returned `Effect` value will also fail.";
const sourceExample =
  "import { Effect } from \"effect\"\n\nconst program = Effect.asSome(Effect.succeed(42))\n\nEffect.runPromise(program).then(console.log)\n// { _id: 'Option', _tag: 'Some', value: 42 }";
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
