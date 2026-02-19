/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: failCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.388Z
 *
 * Overview:
 * Creates an `Effect` that represents a failure with a specific `Cause`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect } from "effect"
 *
 * const program = Effect.failCause(
 *   Cause.fail("Network error")
 * )
 *
 * Effect.runPromiseExit(program).then(console.log)
 * // Output: { _id: 'Exit', _tag: 'Failure', cause: ... }
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
const exportName = "failCause";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates an `Effect` that represents a failure with a specific `Cause`.";
const sourceExample =
  "import { Cause, Effect } from \"effect\"\n\nconst program = Effect.failCause(\n  Cause.fail(\"Network error\")\n)\n\nEffect.runPromiseExit(program).then(console.log)\n// Output: { _id: 'Exit', _tag: 'Failure', cause: ... }";
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
