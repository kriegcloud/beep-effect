/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: asVoid
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.386Z
 *
 * Overview:
 * This function maps the success value of an `Effect` value to `void`. If the original `Effect` value succeeds, the returned `Effect` value will also succeed. If the original `Effect` value fails, the returned `Effect` value will fail with the same error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.asVoid(Effect.succeed(42))
 *
 * Effect.runPromise(program).then(console.log)
 * // undefined (void)
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
const exportName = "asVoid";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "This function maps the success value of an `Effect` value to `void`. If the original `Effect` value succeeds, the returned `Effect` value will also succeed. If the original `Eff...";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.asVoid(Effect.succeed(42))\n\nEffect.runPromise(program).then(console.log)\n// undefined (void)';
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
