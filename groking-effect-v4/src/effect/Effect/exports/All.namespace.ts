/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: All
 * Kind: namespace
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * Namespace containing type utilities for the `Effect.all` function, which handles collecting multiple effects into various output structures.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // All namespace types are used when working with Effect.all
 * const effects = [
 *   Effect.succeed(1),
 *   Effect.succeed("hello"),
 *   Effect.succeed(true)
 * ] as const
 *
 * const program = Effect.all(effects).pipe(
 *   Effect.map(([num, str, bool]) => ({ num, str, bool }))
 * )
 *
 * Effect.runPromise(program).then(console.log) // { num: 1, str: "hello", bool: true }
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
const exportName = "All";
const exportKind = "namespace";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Namespace containing type utilities for the `Effect.all` function, which handles collecting multiple effects into various output structures.";
const sourceExample =
  'import { Effect } from "effect"\n\n// All namespace types are used when working with Effect.all\nconst effects = [\n  Effect.succeed(1),\n  Effect.succeed("hello"),\n  Effect.succeed(true)\n] as const\n\nconst program = Effect.all(effects).pipe(\n  Effect.map(([num, str, bool]) => ({ num, str, bool }))\n)\n\nEffect.runPromise(program).then(console.log) // { num: 1, str: "hello", bool: true }';
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
