/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: timed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.916Z
 *
 * Overview:
 * Measures the runtime of an effect and returns the duration with its result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const [duration, value] = yield* Effect.timed(Effect.succeed("ok"))
 *   yield* Console.log(`took ${Duration.toMillis(duration)}ms: ${value}`)
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
const exportName = "timed";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Measures the runtime of an effect and returns the duration with its result.";
const sourceExample =
  'import { Console, Duration, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const [duration, value] = yield* Effect.timed(Effect.succeed("ok"))\n  yield* Console.log(`took ${Duration.toMillis(duration)}ms: ${value}`)\n})';
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
