/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: onExitIf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.391Z
 *
 * Overview:
 * Runs the cleanup effect only when the `Exit` passes the provided filter.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Filter } from "effect"
 *
 * const exitFilter = Filter.fromPredicate(Exit.isSuccess<number, never>)
 *
 * const program = Effect.onExitIf(
 *   Effect.succeed(42),
 *   exitFilter,
 *   (success) => Console.log(`Succeeded with: ${success.value}`)
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
const exportName = "onExitIf";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs the cleanup effect only when the `Exit` passes the provided filter.";
const sourceExample =
  'import { Console, Effect, Exit, Filter } from "effect"\n\nconst exitFilter = Filter.fromPredicate(Exit.isSuccess<number, never>)\n\nconst program = Effect.onExitIf(\n  Effect.succeed(42),\n  exitFilter,\n  (success) => Console.log(`Succeeded with: ${success.value}`)\n)';
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
