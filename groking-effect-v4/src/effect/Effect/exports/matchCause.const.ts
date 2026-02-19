/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: matchCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.391Z
 *
 * Overview:
 * Handles failures by matching the cause of failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect } from "effect"
 * 
 * const task = Effect.fail("Something went wrong")
 * 
 * const program = Effect.matchCause(task, {
 *   onFailure: (cause) => `Failed: ${Cause.squash(cause)}`,
 *   onSuccess: (value) => `Success: ${value}`
 * })
 * 
 * Effect.runPromise(program).then(console.log)
 * // Output: "Failed: Error: Something went wrong"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "matchCause";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles failures by matching the cause of failure.";
const sourceExample = "import { Cause, Effect } from \"effect\"\n\nconst task = Effect.fail(\"Something went wrong\")\n\nconst program = Effect.matchCause(task, {\n  onFailure: (cause) => `Failed: ${Cause.squash(cause)}`,\n  onSuccess: (value) => `Success: ${value}`\n})\n\nEffect.runPromise(program).then(console.log)\n// Output: \"Failed: Error: Something went wrong\"";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
