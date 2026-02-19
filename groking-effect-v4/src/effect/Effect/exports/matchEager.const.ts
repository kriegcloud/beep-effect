/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: matchEager
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.391Z
 *
 * Overview:
 * Handles both success and failure cases of an effect without performing side effects, with eager evaluation for resolved effects.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* Effect.matchEager(Effect.succeed(42), {
 *     onFailure: (error) => `Failed: ${error}`,
 *     onSuccess: (value) => `Success: ${value}`
 *   })
 *   console.log(result) // "Success: 42"
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "matchEager";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Handles both success and failure cases of an effect without performing side effects, with eager evaluation for resolved effects.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const result = yield* Effect.matchEager(Effect.succeed(42), {\n    onFailure: (error) => `Failed: ${error}`,\n    onSuccess: (value) => `Success: ${value}`\n  })\n  console.log(result) // "Success: 42"\n})';
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
