/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: flip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.909Z
 *
 * Overview:
 * The `flip` function swaps the success and error channels of an effect, so that the success becomes the error, and the error becomes the success.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * //      ┌─── Effect<number, string, never>
 * //      ▼
 * const program = Effect.fail("Oh uh!").pipe(Effect.as(2))
 *
 * //      ┌─── Effect<string, number, never>
 * //      ▼
 * const flipped = Effect.flip(program)
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
const exportName = "flip";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "The `flip` function swaps the success and error channels of an effect, so that the success becomes the error, and the error becomes the success.";
const sourceExample =
  'import { Effect } from "effect"\n\n//      ┌─── Effect<number, string, never>\n//      ▼\nconst program = Effect.fail("Oh uh!").pipe(Effect.as(2))\n\n//      ┌─── Effect<string, number, never>\n//      ▼\nconst flipped = Effect.flip(program)';
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
