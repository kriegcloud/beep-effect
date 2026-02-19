/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchCauseIf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.907Z
 *
 * Overview:
 * Recovers from specific failures based on a predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect } from "effect"
 *
 * const httpRequest = Effect.fail("Network Error")
 *
 * // Only catch network-related failures
 * const program = Effect.catchCauseIf(
 *   httpRequest,
 *   Cause.hasFails,
 *   (cause) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Caught network error: ${Cause.squash(cause)}`)
 *       return "Fallback response"
 *     })
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: "Caught network error: Network Error"
 * // Then: "Fallback response"
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
const exportName = "catchCauseIf";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Recovers from specific failures based on a predicate.";
const sourceExample =
  'import { Cause, Console, Effect } from "effect"\n\nconst httpRequest = Effect.fail("Network Error")\n\n// Only catch network-related failures\nconst program = Effect.catchCauseIf(\n  httpRequest,\n  Cause.hasFails,\n  (cause) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Caught network error: ${Cause.squash(cause)}`)\n      return "Fallback response"\n    })\n)\n\nEffect.runPromise(program).then(console.log)\n// Output: "Caught network error: Network Error"\n// Then: "Fallback response"';
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
