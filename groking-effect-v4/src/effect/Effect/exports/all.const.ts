/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: all
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.385Z
 *
 * Overview:
 * Combines multiple effects into one, returning results based on the input structure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const tupleOfEffects = [
 *   Effect.succeed(42).pipe(Effect.tap(Console.log)),
 *   Effect.succeed("Hello").pipe(Effect.tap(Console.log))
 * ] as const
 *
 * //      ┌─── Effect<[number, string], never, never>
 * //      ▼
 * const resultsAsTuple = Effect.all(tupleOfEffects)
 *
 * Effect.runPromise(resultsAsTuple).then(console.log)
 * // Output:
 * // 42
 * // Hello
 * // [ 42, 'Hello' ]
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
const exportName = "all";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Combines multiple effects into one, returning results based on the input structure.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst tupleOfEffects = [\n  Effect.succeed(42).pipe(Effect.tap(Console.log)),\n  Effect.succeed("Hello").pipe(Effect.tap(Console.log))\n] as const\n\n//      ┌─── Effect<[number, string], never, never>\n//      ▼\nconst resultsAsTuple = Effect.all(tupleOfEffects)\n\nEffect.runPromise(resultsAsTuple).then(console.log)\n// Output:\n// 42\n// Hello\n// [ 42, \'Hello\' ]';
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
