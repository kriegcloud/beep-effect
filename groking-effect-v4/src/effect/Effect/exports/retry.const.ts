/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: retry
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * Retries a failing effect based on a defined retry policy.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * let attempt = 0
 * const task = Effect.callback<string, Error>((resume) => {
 *   attempt++
 *   if (attempt <= 2) {
 *     resume(Effect.fail(new Error(`Attempt ${attempt} failed`)))
 *   } else {
 *     resume(Effect.succeed("Success!"))
 *   }
 * })
 *
 * const policy = Schedule.addDelay(Schedule.recurs(5), () => Effect.succeed("100 millis"))
 * const program = Effect.retry(task, policy)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: "Success!" (after 2 retries)
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
const exportName = "retry";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Retries a failing effect based on a defined retry policy.";
const sourceExample =
  'import { Effect, Schedule } from "effect"\n\nlet attempt = 0\nconst task = Effect.callback<string, Error>((resume) => {\n  attempt++\n  if (attempt <= 2) {\n    resume(Effect.fail(new Error(`Attempt ${attempt} failed`)))\n  } else {\n    resume(Effect.succeed("Success!"))\n  }\n})\n\nconst policy = Schedule.addDelay(Schedule.recurs(5), () => Effect.succeed("100 millis"))\nconst program = Effect.retry(task, policy)\n\nEffect.runPromise(program).then(console.log)\n// Output: "Success!" (after 2 retries)';
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
