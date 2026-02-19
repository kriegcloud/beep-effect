/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchIf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.907Z
 *
 * Overview:
 * Recovers from specific errors using a `Filter`, `Predicate`, or `Refinement`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Filter } from "effect"
 *
 * class NotFound extends Data.TaggedError("NotFound")<{ id: string }> {}
 *
 * const program = Effect.fail(new NotFound({ id: "user-1" }))
 *
 * // With a refinement
 * const recovered = program.pipe(
 *   Effect.catchIf(
 *     (error): error is NotFound => error._tag === "NotFound",
 *     (error) => Effect.succeed(`missing:${error.id}`)
 *   )
 * )
 *
 * // With a Filter
 * const recovered2 = program.pipe(
 *   Effect.catchIf(
 *     Filter.tagged("NotFound"),
 *     (error) => Effect.succeed(`missing:${error.id}`)
 *   )
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchIf";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Recovers from specific errors using a `Filter`, `Predicate`, or `Refinement`.";
const sourceExample =
  'import { Data, Effect, Filter } from "effect"\n\nclass NotFound extends Data.TaggedError("NotFound")<{ id: string }> {}\n\nconst program = Effect.fail(new NotFound({ id: "user-1" }))\n\n// With a refinement\nconst recovered = program.pipe(\n  Effect.catchIf(\n    (error): error is NotFound => error._tag === "NotFound",\n    (error) => Effect.succeed(`missing:${error.id}`)\n  )\n)\n\n// With a Filter\nconst recovered2 = program.pipe(\n  Effect.catchIf(\n    Filter.tagged("NotFound"),\n    (error) => Effect.succeed(`missing:${error.id}`)\n  )\n)';
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
