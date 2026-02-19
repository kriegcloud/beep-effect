/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: never
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Returns an effect that will never produce anything. The moral equivalent of `while(true) {}`, only without the wasted CPU cycles.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // This effect will never complete
 * const program = Effect.never
 *
 * // This will run forever (or until interrupted)
 * // Effect.runPromise(program) // Never resolves
 *
 * // Use with timeout for practical applications
 * const timedProgram = Effect.timeout(program, "1 second")
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
const exportName = "never";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Returns an effect that will never produce anything. The moral equivalent of `while(true) {}`, only without the wasted CPU cycles.";
const sourceExample =
  'import { Effect } from "effect"\n\n// This effect will never complete\nconst program = Effect.never\n\n// This will run forever (or until interrupted)\n// Effect.runPromise(program) // Never resolves\n\n// Use with timeout for practical applications\nconst timedProgram = Effect.timeout(program, "1 second")';
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
