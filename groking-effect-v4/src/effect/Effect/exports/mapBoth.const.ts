/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: mapBoth
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.911Z
 *
 * Overview:
 * Applies transformations to both the success and error channels of an effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * //      ┌─── Effect<number, string, never>
 * //      ▼
 * const simulatedTask = Effect.fail("Oh no!").pipe(Effect.as(1))
 *
 * //      ┌─── Effect<boolean, Error, never>
 * //      ▼
 * const modified = Effect.mapBoth(simulatedTask, {
 *   onFailure: (message) => new Error(message),
 *   onSuccess: (n) => n > 0
 * })
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
const exportName = "mapBoth";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Applies transformations to both the success and error channels of an effect.";
const sourceExample =
  'import { Effect } from "effect"\n\n//      ┌─── Effect<number, string, never>\n//      ▼\nconst simulatedTask = Effect.fail("Oh no!").pipe(Effect.as(1))\n\n//      ┌─── Effect<boolean, Error, never>\n//      ▼\nconst modified = Effect.mapBoth(simulatedTask, {\n  onFailure: (message) => new Error(message),\n  onSuccess: (n) => n > 0\n})';
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
